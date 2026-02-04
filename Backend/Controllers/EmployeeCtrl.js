import Employee from "../Models/EmployeeModel.js";
import { generateToken } from "../Helpers/generateToken.js";
import { sendEmployeePasswordEmail } from "../Helpers/SendMail.js";
import { generateRandomPassword } from "../Helpers/generateRandomPassword.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../Cloudinary/CloudinaryHelper.js"
import Subscription from "../Models/SubscriptionModel.js";
import Task from "../Models/TaskModel.js";
import dayjs from "dayjs";

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
      const Manager = (await import("../Models/ManagerModel.js")).default;
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

export const changeStatus = async (req, res) => {
  try {
    const { id } = req.user;
    const { isActive } = req.body;

    const employee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
        data: null,
      });
    }

    employee.isActive = isActive;
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Status changed successfully",
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



export const getEmployeeTask = async (req, res) => {
  try {
    const { id } = req.user;  // employee id

    // Check employee
    const employee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
        data: null
      });
    }

    // Get all tasks of this employee
    const tasks = await Task.find({
      assignEmployees: id,
      isDeleted: false
    })
      .populate("assignManagerId", "fullName email")
      .populate("adminId", "ownerName email")
      .sort({ createdAt: -1 });

    // Count & filter
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed");
    const pendingTasks = tasks.filter(t => t.status === "pending");

    // Today tasks
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();

    const todayTasks = tasks.filter(task => {
      return task.deadline >= todayStart && task.deadline <= todayEnd;
    });

    res.status(200).json({
      success: true,
      message: "Employee tasks fetched successfully",
      data: {
        totalTasks,
        completedTaskCount: completedTasks.length,
        pendingTaskCount: pendingTasks.length,

        completedTasks,
        pendingTasks,
        todayTasks
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
