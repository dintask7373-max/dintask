import Manager from "../../Models/ManagerModel.js";
import { generateToken } from "../../Helpers/generateToken.js";
import bcrypt from "bcryptjs";
import { joinWorkspace as joinWorkspaceShared } from "../Shared/SharedAuthCtrl.js";

export const joinWorkspace = joinWorkspaceShared;

// ================= MANAGER LOGIN =================
export const loginManager = async (req, res) => {
    try {
        const { email, password } = req.body;

        const manager = await Manager.findOne({ email, isDeleted: false });
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found",
                data: null,
            });
        }

        if (!manager.isActive) {
            return res.status(403).json({
                success: false,
                message: "Manager account is inactive",
                data: null,
            });
        }

        const isMatch = await bcrypt.compare(password, manager.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                data: null,
            });
        }

        const token = generateToken(manager._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: manager,
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { id } = req.user; // JWT middleware se aa raha hoga
        const { oldPassword, newPassword } = req.body;

        // 1. Manager find karo
        const manager = await Manager.findOne({ _id: id, isDeleted: false });
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found",
                data: null,
            });
        }

        // 2. Old password verify karo
        const isMatch = await bcrypt.compare(oldPassword, manager.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
                data: null,
            });
        }

        manager.password = bcrypt.hashSync(newPassword, 10);
        await manager.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};
