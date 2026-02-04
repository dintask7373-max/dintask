import SalesUser from "../../Models/Sales/SalesUserModel.js";
import Manager from "../../Models/ManagerModel.js";
import Admin from "../../Models/AdminModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../Helpers/generateToken.js";
import { joinWorkspace as joinWorkspaceShared } from "../Shared/SharedAuthCtrl.js";

export const joinWorkspace = joinWorkspaceShared;

// @desc    Register a new Sales User
// @route   POST /api/sales/register
// @access  Public
export const registerSalesUser = async (req, res) => {
    try {
        const { fullName, email, mobile, password } = req.body;

        if (!fullName || !email || !password || !mobile) {
            return res.status(400).json({ message: "Please provide all fields: Name, Email, Mobile, Password" });
        }

        // Check if user exists
        const userExists = await SalesUser.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Find a default Manager to assign to (Self-healing)
        let defaultManager = await Manager.findOne();

        // Auto-create Manager if none exists (Self-healing)
        if (!defaultManager) {
            console.log("No Manager found. Creating default Sales Manager...");
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash("manager123", salt);

            let admin = await Admin.findOne();

            if (admin) {
                defaultManager = await Manager.create({
                    fullName: "Default Sales Manager",
                    email: "manager@sales.com",
                    password: hashedPass,
                    role: "manager",
                    status: "active",
                    adminId: admin._id,
                    department: "Sales"
                });
            }
        }

        if (!defaultManager) {
            return res.status(400).json({ message: "No Manager found to assign. Please ask an Admin to create a Manager first." });
        }

        // Create User (Password hashing handled in Model pre-save)
        const user = await SalesUser.create({
            fullName,
            email,
            mobile,
            password,
            role: 'sales',
            managerId: defaultManager._id
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login Sales User
// @route   POST /api/sales/login
// @access  Public
export const loginSalesUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await SalesUser.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                token: generateToken(user._id),
                role: user.role
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
