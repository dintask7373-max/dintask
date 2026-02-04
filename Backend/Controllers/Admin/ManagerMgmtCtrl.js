import Manager from "../../Models/ManagerModel.js";
import Employee from "../../Models/EmployeeModel.js";
import Subscription from "../../Models/SubscriptionModel.js";
import { sendManagerPasswordEmail } from "../../Helpers/SendMail.js";
import { generateRandomPassword } from "../../Helpers/generateRandomPassword.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../../Cloudinary/CloudinaryHelper.js";

// ================= CREATE MANAGER =================
export const createManager = async (req, res) => {
    try {
        const { fullName, email, department } = req.body;

        const { id } = req.user;
        const existing = await Manager.findOne({ email, isDeleted: false });
        if (existing) {
            return res
                .status(400)
                .json({ success: false, message: "Email already exists", data: null });
        }
        // 🔹 Check active subscription for admin
        const activeSub = await Subscription.findOne({
            adminId: id,
            status: "active",
            isDeleted: false,
        }).populate("planId");

        if (!activeSub) {
            return res.status(403).json({
                success: false,
                message: "Cannot create manager. No active subscription found.",
                data: null,
            });
        }

        // 🔹 Count existing managers for this admin
        const managerCount = await Manager.countDocuments({
            adminId: id,
            isDeleted: false,
        });

        // 🔹 Check if limit reached
        const ManagerLimit = activeSub.planId.managerLimit; // plan ke employee limit
        if (managerCount >= ManagerLimit) {
            return res.status(403).json({
                success: false,
                message: `Manager limit reached for your plan. Max allowed: ${ManagerLimit}`,
                data: null,
            });
        }
        const password = await generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const manager = await Manager.create({
            adminId: id,
            fullName,
            email,
            department,
            password: hashedPassword,
        });

        await sendManagerPasswordEmail(email, password, fullName);

        res.status(201).json({
            success: true,
            message: "Manager created successfully",
            data: manager,
            password: password
        });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message, data: null });
    }
};

// ================= GET ALL MANAGERS =================
export const getAllManagers = async (req, res) => {
    try {
        // 1. Fetch all managers
        const managers = await Manager.find({ isDeleted: false })
            .populate("adminId", "ownerName email");

        // 2. Fetch employees for each manager
        const managersWithTeam = await Promise.all(
            managers.map(async (manager) => {
                const teamMembers = await Employee.find({
                    assignManagerId: manager._id,
                    isDeleted: false
                }).select("fullName email avatar role roleName isActive");

                const totalTeam = teamMembers.length;
                const activeTeam = teamMembers.filter(emp => emp.isActive).length;
                const employeeCount = totalTeam;

                return {
                    ...manager.toObject(),
                    teamMembers,
                    totalTeam,
                    activeTeam,
                    employeeCount
                };
            })
        );

        // 3. Admin-level summary
        const totalManagers = managersWithTeam.length;
        const activeTeams = managersWithTeam.filter(m => m.activeTeam > 0).length;
        const employeeCount = managersWithTeam.reduce((sum, m) => sum + m.employeeCount, 0);

        res.status(200).json({
            success: true,
            message: "Managers fetched successfully with their team",
            summary: {
                totalManagers,
                activeTeams,
                employeeCount
            },
            data: managersWithTeam
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};


// ================= GET SINGLE MANAGER =================
export const getSingleManager = async (req, res) => {
    try {
        const { id } = req.params;

        const manager = await Manager.findOne({
            _id: id,
            isDeleted: false,
        }).populate("adminId", "ownerName email");

        if (!manager) {
            return res.status(404).json({ success: false, message: "Manager not found", data: null });
        }

        // Fetch manager's team
        const teamMembers = await Employee.find({
            assignManagerId: manager._id,
            isDeleted: false
        }).select("fullName email avatar role roleName isActive");


        res.status(200).json({
            success: true,
            message: "Manager fetched successfully with team details",
            data: {
                ...manager.toObject(),
                teamMembers
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ================= UPDATE MANAGER =================
export const updateManager = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, department, isActive } = req.body;

        const manager = await Manager.findOne({ _id: id, isDeleted: false });
        if (!manager) {
            return res
                .status(404)
                .json({ success: false, message: "Manager not found", data: null });
        }

        manager.fullName = fullName ?? manager.fullName;
        manager.department = department ?? manager.department;
        manager.isActive = isActive ?? manager.isActive;

        if (req.file) {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                "manager_avatars",
            );
            manager.avatar = uploadResult.url;
        }

        await manager.save();

        res.status(200).json({
            success: true,
            message: "Manager updated successfully",
            data: manager,
        });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message, data: null });
    }
};

// ================= DELETE MANAGER (SOFT) =================
export const deleteManager = async (req, res) => {
    try {
        const { id } = req.params;

        const manager = await Manager.findOne({ _id: id, isDeleted: false });
        if (!manager) {
            return res
                .status(404)
                .json({ success: false, message: "Manager not found", data: null });
        }

        manager.isDeleted = true;
        await manager.save();

        res.status(200).json({
            success: true,
            message: "Manager deleted successfully",
            data: null,
        });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message, data: null });
    }
};

// ================= CHANGE STATUS =================
export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const manager = await Manager.findOne({ _id: id, isDeleted: false });
        if (!manager) {
            return res
                .status(404)
                .json({ success: false, message: "Manager not found", data: null });
        }

        manager.isActive = isActive;
        await manager.save();

        res.status(200).json({
            success: true,
            message: "Manager status changed successfully",
            data: manager,
        });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message, data: null });
    }
};
