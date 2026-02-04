import Employee from "../../Models/EmployeeModel.js";
import { generateToken } from "../../Helpers/generateToken.js";
import bcrypt from "bcryptjs";
import { joinWorkspace as joinWorkspaceShared } from "../Shared/SharedAuthCtrl.js";

// Re-export shared Join Workspace
export const joinWorkspace = joinWorkspaceShared;

// ================= EMPLOYEE LOGIN =================
export const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        const employee = await Employee.findOne({ email, isDeleted: false });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null,
            });
        }

        if (!employee.isActive) {
            return res.status(403).json({
                success: false,
                message: "Employee account is inactive",
                data: null,
            });
        }

        // 🔹 New Check: If Manager is Inactive (Rejected/Pending), Employee cannot login
        const EmployeeManager = await Employee.findOne({ email, isDeleted: false }).populate("assignManagerId");

        if (EmployeeManager && EmployeeManager.assignManagerId && !EmployeeManager.assignManagerId.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your Manager's account is not active. Please contact your administrator.",
                data: null
            });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                data: null,
            });
        }

        const token = generateToken(employee._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: employee,
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


// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { oldPassword, newPassword } = req.body;

        const employee = await Employee.findOne({ _id: id, isDeleted: false });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null,
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, employee.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
                data: null,
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        employee.password = hashedPassword;
        await employee.save();

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
