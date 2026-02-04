import Manager from "../Models/ManagerModel.js";
import { sendManagerPasswordEmail } from "../Helpers/SendMail.js";
import { generateToken } from "../Helpers/generateToken.js";
import { generateRandomPassword } from "../Helpers/generateRandomPassword.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../Cloudinary/CloudinaryHelper.js";
import Subscription from "../Models/SubscriptionModel.js";
import Employee from "../Models/EmployeeModel.js";
import Task from "../Models/TaskModel.js";
import dayjs from "dayjs";

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

export const teamMembers = async (req, res) => {
  try {
    const { id } = req.user; // manager id

    // 1️⃣ Get team members
    const teamMembers = await Employee.find({
      assignManagerId: id,
      isDeleted: false
    }).select("fullName email avatar role roleName isActive");

    const teamWithTasks = await Promise.all(
      teamMembers.map(async (member) => {

        // 2️⃣ Get tasks of this employee
        const tasks = await Task.find({
          assignEmployees: member._id,
          isDeleted: false
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === "completed").length;
        const activeTasks = tasks.filter(t => t.status === "pending").length;

        return {
          ...member.toObject(),
          totalTasks,
          activeTasks,
          completedTasks
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Team members with task stats fetched successfully",
      data: teamWithTasks
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getTeamProgressData = async (req, res) => {
  try {
    const { id } = req.user; // manager id

    // 1️⃣ Get team members
    const teamMembers = await Employee.find({
      assignManagerId: id,
      isDeleted: false
    }).select("_id fullName email avatar roleName");

    const teamMemberIds = teamMembers.map(emp => emp._id);

    // 2️⃣ Get all team tasks
    const teamTasks = await Task.find({
      assignEmployees: { $in: teamMemberIds },
      isDeleted: false
    });

    const totalTasks = teamTasks.length;
    const completedTasks = teamTasks.filter(t => t.status === "completed").length;
    const pendingTasks = teamTasks.filter(t => t.status === "pending").length;

    const successRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // 3️⃣ Calculate employee-wise completed tasks
    const employeeStats = await Promise.all(
      teamMembers.map(async (emp) => {
        const empTasks = await Task.find({
          assignEmployees: emp._id,
          isDeleted: false
        });

        const completed = empTasks.filter(t => t.status === "completed").length;

        return {
          _id: emp._id,
          fullName: emp.fullName,
          email: emp.email,
          avatar: emp.avatar,
          roleName: emp.roleName,
          completedTasks: completed
        };
      })
    );

    // 4️⃣ Top 5 performers
    const topPerformers = employeeStats
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .slice(0, 5);

    // 5️⃣ Response
    res.status(200).json({
      success: true,
      message: "Team progress data fetched successfully",
      data: {
        totalTeamMembers: teamMembers.length,
        totalTasks,
        completedTasks,
        pendingTasks,
        successRate, // %
        topPerformers
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

export const getManagerReports = async (req, res) => {
  try {
    const { id } = req.user; // manager id

    // 1️⃣ All manager tasks
    const tasks = await Task.find({
      assignManagerId: id,
      isDeleted: false,
    });

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const cancelledTasks = tasks.filter(t => t.status === "cancelled").length;
    const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;

    // 2️⃣ Current week range
    const weekStart = dayjs().startOf("week").toDate();
    const weekEnd = dayjs().endOf("week").toDate();

    // 3️⃣ Completed tasks of this week (using updatedAt)
    const weekCompletedTasks = await Task.find({
      assignManagerId: id,
      status: "completed",
      isDeleted: false,
      updatedAt: {
        $gte: weekStart,
        $lte: weekEnd
      }
    });

    // 4️⃣ Day-wise count
    const dayWiseCompleted = {};

    weekCompletedTasks.forEach(task => {
      const day = dayjs(task.updatedAt).format("dddd");
      dayWiseCompleted[day] = (dayWiseCompleted[day] || 0) + 1;
    });

    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const weeklyReport = weekDays.map(day => ({
      day,
      completedTasks: dayWiseCompleted[day] || 0
    }));

    // 5️⃣ Response
    res.status(200).json({
      success: true,
      message: "Manager report fetched successfully",
      data: {
        totalTasks,
        pendingTasks,
        completedTasks,
        cancelledTasks,
        inProgressTasks,
        weeklyCompletedReport: weeklyReport
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

