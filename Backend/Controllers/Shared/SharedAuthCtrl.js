import Admin from "../../Models/AdminModel.js";
import Employee from "../../Models/EmployeeModel.js";
import Manager from "../../Models/ManagerModel.js";
import SalesUser from "../../Models/Sales/SalesUserModel.js";

// ================= JOIN WORKSPACE (Role Based & Strict) =================
export const joinWorkspace = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const { id, role } = req.user; // User ID and Role from Token

        if (!inviteCode) {
            return res.status(400).json({ success: false, message: "Invite Code is required" });
        }

        const admin = await Admin.findOne({
            $or: [
                { "inviteCodes.employee": inviteCode },
                { "inviteCodes.manager": inviteCode },
                { "inviteCodes.sales": inviteCode },
            ],
        });

        if (!admin) {
            return res.status(404).json({ success: false, message: "Invalid Invite Code" });
        }

        let endpointRoleMatch = false;

        const checkAndJoin = async (Model, roleKey) => {
            if (admin.inviteCodes[roleKey] !== inviteCode) {
                return { match: true, error: `This code is not for ${roleKey}s.` };
            }

            const user = await Model.findById(id);

            // If already verified with SAME admin, return success
            if (user.adminId && user.adminId.toString() === admin._id.toString() && user.isWorkspaceVerified) {
                return { match: true, alreadyVerified: true };
            }

            // Else update (New join or Re-join)
            await Model.findByIdAndUpdate(id, {
                adminId: admin._id,
                isWorkspaceVerified: false, // Pending Approval
            });

            return { match: true };
        };

        let result = { match: false };

        // --- EMPLOYEE ---
        if (role === "employee" || role === "Employee") {
            result = await checkAndJoin(Employee, "employee");
        }
        // --- MANAGER ---
        else if (role === "manager" || role === "Manager") {
            result = await checkAndJoin(Manager, "manager");
        }
        // --- SALES ---
        else if (role === "sales" || role === "SalesUser" || role === "salesUser") {
            result = await checkAndJoin(SalesUser, "sales");
        }

        if (!result.match) {
            return res.status(400).json({ success: false, message: "Role mismatch or unknown role in token." });
        }

        if (result.error) {
            return res.status(403).json({ success: false, message: result.error });
        }

        if (result.alreadyVerified) {
            return res.status(200).json({
                success: true,
                message: "You are already a verified member of this workspace!",
                adminDetails: {
                    companyName: admin.companyName,
                    ownerName: admin.ownerName
                }
            });
        }

        res.status(200).json({
            success: true,
            message: "Request sent to Admin for approval!",
            adminDetails: {
                companyName: admin.companyName,
                ownerName: admin.ownerName
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
