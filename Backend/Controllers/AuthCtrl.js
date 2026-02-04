import SuperAdmin from "../Models/AuthModel.js";
import Admin from "../Models/AdminModel.js";
import { generateToken } from "../Helpers/generateToken.js"
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../Cloudinary/CloudinaryHelper.js"
import Subscription from "../Models/SubscriptionModel.js";
import Task from "../Models/TaskModel.js";
// import Manager from "../Models/ManagerModel.js";
// import Employee from "../Models/EmployeeModel.js";

// ================= LOGIN SUPER ADMIN =================
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "SuperAdmin not found",
        data: null
      });
    }

    const isMatch = await superAdmin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        data: null
      });
    }

    const token = await generateToken(superAdmin._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: superAdmin,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

import Plan from "../Models/PlanModel.js";

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
      // razorpay details empty for free plan
    });

    res.status(201).json({ success: true, message: "Admin created successfully with Free Plan", data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};


// ================= GET ALL ADMINS =================
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ isDeleted: false });

    // 🔹 Fetch active subscription for each admin
    const adminsWithSubscription = await Promise.all(
      admins.map(async (admin) => {
        const activeSub = await Subscription.findOne({
          adminId: admin._id,
          status: "active",
          isDeleted: false,
        }).populate("planId");

        return {
          ...admin.toObject(),
          activeSubscription: activeSub || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      data: adminsWithSubscription,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// ================= GET SINGLE ADMIN =================
export const getSingleAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findOne({ _id: id, isDeleted: false });
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found", data: null });

    // 🔹 Fetch active subscription
    const activeSub = await Subscription.findOne({
      adminId: admin._id,
      status: "active",
      isDeleted: false,
    }).populate("planId");

    res.status(200).json({
      success: true,
      message: "Admin fetched successfully",
      data: {
        ...admin.toObject(),
        activeSubscription: activeSub || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// ================= UPDATE ADMIN =================
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerName, email, companyName } = req.body;

    const admin = await Admin.findById(id, { isDeleted: false });
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found", data: null });

    admin.ownerName = ownerName ?? admin.ownerName;
    admin.email = email ?? admin.email;
    admin.companyName = companyName ?? admin.companyName;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "admin_avatars"
      );
      admin.avatar = uploadResult.url;
    }
    await admin.save();
    res.status(200).json({ success: true, message: "Admin updated successfully", data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// ================= DELETE ADMIN (Soft Delete) =================
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id, { isDeleted: false });
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found", data: null });

    admin.isDeleted = true;
    await admin.save();

    res.status(200).json({ success: true, message: "Admin deleted successfully", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// ================= CHANGE STATUS =================
export const changeAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const admin = await Admin.findById(id, { isDeleted: false });
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found", data: null });

    admin.status = status ?? admin.status;
    await admin.save();

    res.status(200).json({ success: true, message: "Admin status updated", data: admin });
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


export const adminReports = async (req, res) => {
  try {
    const { userId, filterType } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
        data: null
      });
    }

    // Date filter
    let startDate = new Date();

    if (filterType === "last7days") {
      startDate.setDate(startDate.getDate() - 7);
    }
    else if (filterType === "last30days") {
      startDate.setDate(startDate.getDate() - 30);
    }
    else if (filterType === "thisYear") {
      startDate = new Date(new Date().getFullYear(), 0, 1);
    }

    // Check user role
    const manager = await Manager.findById(userId);
    const employee = await Employee.findById(userId);

    if (!manager && !employee) {
      return res.status(404).json({
        success: false,
        message: "User not found in manager or employee",
        data: null
      });
    }

    let filter = {
      isDeleted: false,
      createdAt: { $gte: startDate }
    };

    // Agar employee hai
    if (employee) {
      filter.assignEmployees = userId;
    }

    // Agar manager hai
    if (manager) {
      filter.assignManagerId = userId;
    }

    const totalTasks = await Task.countDocuments(filter);

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "completed"
    });

    const pendingTasks = totalTasks - completedTasks;

    const completionRate =
      totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      message: "User Task Report Generated Successfully",
      role: manager ? "manager" : "employee",
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: `${completionRate}%`
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

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

// ================= JOIN WORKSPACE (Role Based & Strict) =================
import Employee from "../Models/EmployeeModel.js";
import Manager from "../Models/ManagerModel.js";
import SalesUser from "../Models/Sales/SalesUserModel.js";

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
