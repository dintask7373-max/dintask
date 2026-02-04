import Admin from "../../Models/AdminModel.js";
import Employee from "../../Models/EmployeeModel.js";
import Manager from "../../Models/ManagerModel.js";
import SalesUser from "../../Models/Sales/SalesUserModel.js";

// ================= GENERATE INVITE CODE (Role Based) =================
export const generateInviteCode = async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.user; // Admin ID

        if (!["employee", "manager", "sales"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role selected" });
        }

        // Generate random 4-char string (e.g., "X9Y2")
        const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

        // Prefix based on role
        let prefix = "";
        if (role === "employee") prefix = "EMP";
        if (role === "manager") prefix = "MNG";
        if (role === "sales") prefix = "SLS";

        const inviteCode = `${prefix}-${randomCode}`;

        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        // Update specific role code
        if (!admin.inviteCodes) admin.inviteCodes = {};
        admin.inviteCodes[role] = inviteCode;

        await admin.save();

        res.status(200).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} Invite Code Generated Successfully`,
            inviteCode,
            role
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= GET JOIN REQUESTS (Admin) =================
export const getJoinRequests = async (req, res) => {
    try {
        const { id } = req.user; // Admin ID

        // Fetch Pending Employees
        const employees = await Employee.find({
            adminId: id,
            isWorkspaceVerified: false,
            isDeleted: false
        }).select("fullName email mobile role createdAt avatar");

        // Fetch Pending Managers
        const managers = await Manager.find({
            adminId: id,
            isWorkspaceVerified: false,
            isDeleted: false
        }).select("fullName email department role createdAt avatar");

        // Fetch Pending Sales Users
        const salesUsers = await SalesUser.find({
            adminId: id,
            isWorkspaceVerified: false,
            isActive: true
        }).select("fullName email mobile role createdAt avatar");

        // Combine and Format
        const requests = [
            ...employees.map(u => ({ ...u.toObject(), type: "employee" })),
            ...managers.map(u => ({ ...u.toObject(), type: "manager" })),
            ...salesUsers.map(u => ({ ...u.toObject(), type: "sales" }))
        ];

        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= HANDLE JOIN REQUEST (Verify/Reject) =================
export const handleJoinRequest = async (req, res) => {
    try {
        const { userId, role, action } = req.body; // action: 'verify' | 'reject'
        const { id: adminId } = req.user;

        if (!["verify", "reject"].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        let Model;
        if (role === "employee") Model = Employee;
        else if (role === "manager") Model = Manager;
        else if (role === "sales") Model = SalesUser;
        else return res.status(400).json({ success: false, message: "Invalid role" });

        const user = await Model.findOne({ _id: userId, adminId });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found or not linked to you" });
        }

        if (action === "verify") {
            user.isWorkspaceVerified = true;
            await user.save();
            return res.status(200).json({ success: true, message: "User verified successfully" });
        }

        if (action === "reject") {
            // Unlink Admin
            user.adminId = null;
            user.isWorkspaceVerified = false;
            await user.save();
            return res.status(200).json({ success: true, message: "Request rejected" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
