import Admin from "../../Models/AdminModel.js";
import Plan from "../../Models/PlanModel.js";
import Subscription from "../../Models/SubscriptionModel.js";
import { generateToken } from "../../Helpers/generateToken.js";
import bcrypt from "bcryptjs";

// ================= CREATE ADMIN (Register) =================
export const createAdmin = async (req, res) => {
    try {
        const { ownerName, email, companyName, password } = req.body;

        const existing = await Admin.findOne({ email, isDeleted: false });
        if (existing) return res.status(400).json({ success: false, message: "Email already exists", data: null });

        const admin = await Admin.create({ ownerName, email, companyName, password });

        // 🔹 Assign Default Free Plan
        let freePlan = await Plan.findOne({ planName: "Free Trial", isDeleted: false });

        // If Free Plan doesn't exist, create one
        if (!freePlan) {
            freePlan = await Plan.create({
                planName: "Free Trial",
                planPrice: 0,
                planType: "monthly",
                planTier: "starter",
                employeeLimit: 5, // Default limit for free tier
                managerLimit: 1,
                planDetails: ["Free access for testing"],
                isActive: true
            });
        }

        // 🔹 Create Active Subscription
        await Subscription.create({
            adminId: admin._id,
            planId: freePlan._id,
            status: "active",
            finalPayableAmount: 0,
        });

        res.status(201).json({ success: true, message: "Admin created successfully with Free Plan", data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ================= LOGIN ADMIN =================
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email, isDeleted: false });
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found", data: null });

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials", data: null });

        const token = generateToken(admin._id);

        res.status(200).json({ success: true, message: "Login successful", data: admin, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const admin = await Admin.findById(req.user._id);
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch)
            return res
                .status(400)
                .json({ success: false, message: "Old password incorrect", data: null });

        admin.password = newPassword;
        await admin.save();

        res.json({ success: true, message: "Password changed successfully", data: null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", data: null });
    }
};
