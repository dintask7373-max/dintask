import Employee from "../../Models/EmployeeModel.js";
import Subscription from "../../Models/SubscriptionModel.js";
import { generateRandomPassword } from "../../Helpers/generateRandomPassword.js";
import { sendEmployeePasswordEmail } from "../../Helpers/SendMail.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../../Cloudinary/CloudinaryHelper.js";

// ================= CREATE EMPLOYEE =================
export const createEmployee = async (req, res) => {
    try {
        const { fullName, email, role, roleName, assignManagerId } = req.body;

        const existing = await Employee.findOne({ email, isDeleted: false });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already exists", data: null });
        }

        // 🔹 Check active subscription for admin
        const activeSub = await Subscription.findOne({
            adminId: req.user.id,
            status: "active",
            isDeleted: false,
        }).populate("planId");

        if (!activeSub) {
            return res.status(403).json({
                success: false,
                message: "Cannot create employee. No active subscription found.",
                data: null,
            });
        }

        // 🔹 Count existing employees for this admin
        const employeeCount = await Employee.countDocuments({
            adminId: req.user.id,
            isDeleted: false,
        });

        // 🔹 Check if limit reached
        const EmployeeLimit = activeSub.planId.employeeLimit; // plan ke employee limit
        if (employeeCount >= EmployeeLimit) {
            return res.status(403).json({
                success: false,
                message: `Employee limit reached for your plan. Max allowed: ${EmployeeLimit}`,
                data: null,
            });
        }

        // 🔹 Auto-Assign Manager if not provided
        let managerIdToAssign = assignManagerId;
        if (!managerIdToAssign) {
            // Find any manager belonging to this Admin
            const Manager = (await import("../../Models/ManagerModel.js")).default;
            const defaultManager = await Manager.findOne({
                adminId: req.user.id,
                isDeleted: false
            });

            if (defaultManager) {
                managerIdToAssign = defaultManager._id;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "No Manager found in your company. Please create a Manager first to assign to this employee.",
                    data: null
                });
            }
        }

        const password = await generateRandomPassword()
        const hashedPassword = await bcrypt.hash(password, 10);
        const employee = await Employee.create({
            fullName,
            email,
            role,
            roleName,
            assignManagerId: managerIdToAssign,
            password: hashedPassword,
            adminId: req.user.id,
        });

        // send auto password on email
        await sendEmployeePasswordEmail(email, password, fullName);

        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
            password: password
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};


// ================= GET ALL EMPLOYEES =================
export const getAllEmployees = async (req, res) => {
    try {
        const { id } = req.user; // admin id

        const employees = await Employee.find({
            adminId: id,
            isDeleted: false,
        }).populate("assignManagerId", "fullName email");

        res.status(200).json({
            success: true,
            message: "Employees fetched successfully",
            data: employees,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};


// ================= GET SINGLE EMPLOYEE =================
export const getSingleEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({ _id: id, isDeleted: false })
            .populate("adminId", "fullName email");

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found", data: null });
        }

        res.status(200).json({
            success: true,
            message: "Employee fetched successfully",
            data: employee,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};


// ================= UPDATE EMPLOYEE =================
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, role, roleName, isActive } = req.body;

        const employee = await Employee.findOne({ _id: id, isDeleted: false });
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found", data: null });
        }

        employee.fullName = fullName ?? employee.fullName;
        employee.role = role ?? employee.role;
        employee.roleName = roleName ?? employee.roleName;
        employee.isActive = isActive ?? employee.isActive;

        if (req.file) {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                "employee_avatars"
            );
            employee.avatar = uploadResult.url;
        }
        await employee.save();

        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};


// ================= DELETE EMPLOYEE (SOFT) =================
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({ _id: id, isDeleted: false });
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found", data: null });
        }

        employee.isDeleted = true;
        await employee.save();

        res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
            data: null,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
};
