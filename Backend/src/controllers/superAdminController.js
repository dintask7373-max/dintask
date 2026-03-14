const mongoose = require('mongoose');
const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const SalesExecutive = require('../models/SalesExecutive');
const Employee = require('../models/Employee');
const LoginActivity = require('../models/LoginActivity');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Lead = require('../models/Lead');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');

// @desc    Get system stats
// @route   GET /api/v1/superadmin/stats
// @access  Private (Super Admin)
exports.getStats = async (req, res, next) => {
  try {
    // Logic for system wide stats
    res.status(200).json({
      success: true,
      message: 'System stats only for Super Admin'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Maintain Admins (Create/Delete/Update Admins specifically)
// @route   GET /api/v1/superadmin/admins
// @access  Private (Super Admin)
// @desc    Get All Admins
// @route   GET /api/v1/superadmin/admins
// @access  Private (Super Admin)
exports.getAdmins = async (req, res, next) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Search query
    const matchQuery = {};
    if (search) {
      matchQuery.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await Admin.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            {
              $lookup: {
                from: 'plans',
                localField: 'subscriptionPlanId',
                foreignField: '_id',
                as: 'plan'
              }
            },
            { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'managers',
                localField: '_id',
                foreignField: 'adminId',
                as: 'managers'
              }
            },
            {
              $lookup: {
                from: 'salesexecutives',
                localField: '_id',
                foreignField: 'adminId',
                as: 'sales'
              }
            },
            {
              $lookup: {
                from: 'employees',
                localField: '_id',
                foreignField: 'adminId',
                as: 'employees'
              }
            },
            {
              $addFields: {
                totalUsers: {
                  $add: [
                    { $size: '$managers' },
                    { $size: '$sales' },
                    { $size: '$employees' }
                  ]
                },
                userLimit: '$plan.userLimit'
              }
            },
            {
              $project: {
                managers: 0,
                sales: 0,
                employees: 0,
                password: 0
              }
            },
            {
              $lookup: {
                from: 'partners',
                localField: 'partnerId',
                foreignField: '_id',
                as: 'referredBy'
              }
            },
            { $unwind: { path: '$referredBy', preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]);

    const admins = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    console.log('Admins fetched:', admins.map(a => ({ id: a._id, email: a.email, company: a.companyName })));

    res.status(200).json({
      success: true,
      count: admins.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: admins
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Admin (Provision Account)
// @route   POST /api/v1/superadmin/admins
// @access  Private (Super Admin)
exports.createAdmin = async (req, res, next) => {
  try {
    const { companyName, name, email, subscriptionPlan, password } = req.body;

    // Validation
    if (!companyName || !name || !email) {
      return next(new ErrorResponse('Please provide company name, owner name and email', 400));
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return next(new ErrorResponse('Please provide a valid email', 400));
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return next(new ErrorResponse('Admin with this email already exists', 400));
    }

    // Default password if not provided
    const adminPassword = password || 'DinTask@123';

    // Calculate subscription expiry
    let subscriptionExpiry = null;
    if (req.body.subscriptionPlanId) {
      const plan = await Plan.findById(req.body.subscriptionPlanId);
      if (plan) {
        subscriptionExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
      }
    } else {
      // Default to 30 days if no plan ID provided (e.g. Starter)
      subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Sanitize ObjectIds from frontend
    const partnerId = (req.body.partnerId === 'none' || !req.body.partnerId || req.body.partnerId.trim() === '') ? undefined : req.body.partnerId;
    const subscriptionPlanId = (req.body.subscriptionPlanId === 'none' || !req.body.subscriptionPlanId || req.body.subscriptionPlanId.trim() === '') ? undefined : req.body.subscriptionPlanId;

    const admin = await Admin.create({
      companyName,
      name,
      email,
      subscriptionPlan,
      subscriptionPlanId,
      partnerId,
      password: adminPassword,
      subscriptionStatus: 'active',
      subscriptionExpiry
    });


    // Send email to new admin
    const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontendUrl = rawFrontendUrl.split(',')[0].trim();
    const adminPanelLink = `${frontendUrl}/admin/login`;

    const message = `Hello ${name},\n\nYour company account for ${companyName} has been provisioned at DinTask.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${adminPassword}\n\nDin Task Web link: ${frontendUrl}\nAdmin Panel Link: ${adminPanelLink}\n\nPlease login and change your password immediately.\n\nRegards,\nDinTask Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #3b82f6; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to DinTask</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your company account for <strong>${companyName}</strong> has been successfully provisioned.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin-top: 0; font-weight: bold; color: #1f2937;">Login Credentials:</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${adminPassword}</p>
          </div>

          <p>You can access your account through the links below:</p>
          
          <div style="margin: 20px 0;">
            <a href="${adminPanelLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Go to Admin Panel</a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            <strong>Din Task Web link:</strong> <a href="${frontendUrl}" style="color: #3b82f6;">${frontendUrl}</a><br>
            <strong>Admin Panel Link:</strong> <a href="${adminPanelLink}" style="color: #3b82f6;">${adminPanelLink}</a>
          </p>

          <p style="margin-top: 30px; font-weight: bold; color: #ef4444;">Please change your password immediately after your first login for security reasons.</p>
        </div>
        <div style="background-color: #f3f4f6; color: #6b7280; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} DinTask Team. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: admin.email,
        subject: 'Account Provisioned - DinTask',
        message,
        html
      });
    } catch (err) {
      console.error('Account Provisioning Email Error:', err);
    }

    res.status(201).json({
      success: true,
      data: admin
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Admin (Name, Email, Status)
// @route   PUT /api/v1/superadmin/admins/:id
// @access  Private (Super Admin)
exports.updateAdmin = async (req, res, next) => {
  try {
    console.log('Update Admin Request:', { id: req.params.id, body: req.body });
    const { companyName, name, email, subscriptionStatus } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        companyName,
        name,
        email,
        subscriptionStatus
      },
      { new: true, runValidators: true }
    );

    if (!admin) {
      console.error(`[Admin Update] NOT FOUND: id ${req.params.id}`);
      return next(new ErrorResponse(`Admin not found with id of ${req.params.id}`, 404));
    }

    // Force logout if suspended
    if (subscriptionStatus === 'suspended' && global.io) {
      console.log(`[Socket] Emitting forceLogout for company: ${req.params.id}`);
      global.io.emit('forceLogout', { adminId: req.params.id.toString() });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (err) {
    console.error('Update Admin Error:', err);
    next(err);
  }
};

// @desc    Delete Admin
// @route   DELETE /api/v1/superadmin/admins/:id
// @access  Private (Super Admin)
exports.deleteAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return next(new ErrorResponse(`Admin not found with id of ${adminId}`, 404));
    }

    // 1. Force logout all users associated with this admin via Socket.io
    if (global.io) {
      console.log(`[Socket] Emitting forceLogout for cascading deletion of company: ${adminId}`);
      global.io.emit('forceLogout', { adminId: adminId.toString() });
    }

    // 2. Cascading deletion across all related collections
    // We collect all user IDs first to clean up LoginActivity records
    const [managerIds, employeeIds, salesIds] = await Promise.all([
      Manager.find({ adminId }).distinct('_id'),
      Employee.find({ adminId }).distinct('_id'),
      SalesExecutive.find({ adminId }).distinct('_id')
    ]);

    const allUserIds = [adminId, ...managerIds, ...employeeIds, ...salesIds];

    // We use Promise.all to delete data from all related tables in parallel
    await Promise.all([
      Manager.deleteMany({ adminId }),
      Employee.deleteMany({ adminId }),
      SalesExecutive.deleteMany({ adminId }),
      Notification.deleteMany({ adminId }),
      Lead.deleteMany({ adminId }),
      Project.deleteMany({ adminId }),
      Task.deleteMany({ adminId }),
      Team.deleteMany({ adminId }),
      Payment.deleteMany({ adminId }),
      LoginActivity.deleteMany({ userId: { $in: allUserIds } }),
      Admin.findByIdAndDelete(adminId)
    ]);

    res.status(200).json({
      success: true,
      message: 'Company and all associated data (Managers, Employees, Leads, Projects, etc.) have been permanently deleted',
      data: {}
    });
  } catch (err) {
    console.error('Cascading Delete Admin Error:', err);
    next(err);
  }
};

// @desc    Update Admin Plan
// @route   PUT /api/v1/superadmin/admins/:id/plan
// @access  Private (Super Admin)
exports.updateAdminPlan = async (req, res, next) => {
  try {
    const { planId: rawPlanId, planName } = req.body;
    const planId = (rawPlanId === 'none' || !rawPlanId || (typeof rawPlanId === 'string' && rawPlanId.trim() === '')) ? undefined : rawPlanId;

    if (!planId) {
      return next(new ErrorResponse('Please provide a valid plan ID', 400));
    }

    // Get plan duration
    const plan = await Plan.findById(planId);
    if (!plan) {
      return next(new ErrorResponse(`Plan not found with id of ${planId}`, 404));
    }

    const subscriptionExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        subscriptionPlanId: planId,
        subscriptionPlan: planName,
        subscriptionExpiry,
        subscriptionStatus: 'active'
      },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return next(new ErrorResponse(`Admin not found with id of ${req.params.id}`, 404));
    }

    // Notify Admin of Plan Update
    try {
      await Notification.create({
        recipient: admin._id,
        sender: req.user.id,
        type: 'general',
        title: 'Plan Updated',
        message: `Your plan has been updated to ${planName} by the Super Admin.`,
        link: '/billing'
      });
    } catch (error) {
      console.error('Notification Error:', error);
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login Super Admin
// @route   POST /api/v1/superadmin/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { adminId, secureKey } = req.body;

    // Validate adminId & secureKey
    if (!adminId || !secureKey) {
      return next(new ErrorResponse('Please provide Administrator ID and Secure Key', 400));
    }

    // Check for user
    const superAdmin = await SuperAdmin.findOne({ email: adminId }).select('+password');

    if (!superAdmin) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await superAdmin.matchPassword(secureKey);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Set status to active
    superAdmin.status = 'active';
    await superAdmin.save();

    sendTokenResponse(superAdmin, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout Super Admin / Clear Cookie
// @route   GET /api/v1/superadmin/logout
// @access  Public
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await SuperAdmin.findByIdAndUpdate(req.user.id, { status: 'inactive' });
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Use the actual role from the user model
  const token = jwt.sign(
    { id: user._id, role: user.role || 'superadmin' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'superadmin'
    }
  });
};

// @desc    Forgot Password
// @route   POST /api/v1/superadmin/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await SuperAdmin.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    // Create reset url
    // Since we don't have frontend URL env yet, assuming localhost for now or generic format
    // Ideally: `${req.protocol}://${req.get('host')}/reset-password/${resetToken}` for backend only
    // asking user for frontend URL might be better, but let's stick to standard practice
    // User requested "reset link" behavior.

    // We will point to specific frontend URL or just return token? 
    // Usually points to frontend reset page.
    // Let's assume standard local dev URL for now: http://localhost:5173/reset-password/${resetToken}

    // NOTE: Saving without validating other fields
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontendUrl = rawFrontendUrl.split(',')[0].trim();
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}?role=${user.role}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #ef4444; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hello,</p>
          <p>You are receiving this email because you (or someone else) has requested the reset of a password for your <strong>DinTask SuperAdmin</strong> account.</p>
          
          <p>Please click the button below to reset your password. This link will expire in <strong>10 minutes</strong>.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br>
            <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
          </p>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div style="background-color: #f3f4f6; color: #6b7280; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} DinTask Team. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token - DinTask',
        message,
        html
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password
// @route   PUT /api/v1/superadmin/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await SuperAdmin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Update Profile Image
// @route   PUT /api/v1/superadmin/updateprofileimage
// @access  Private
exports.updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const user = await SuperAdmin.findById(req.user.id);

    user.profileImage = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      data: user.profileImage
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change Password (Logged in Super Admin)
// @route   PUT /api/v1/superadmin/changepassword
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse('Please provide current and new password', 400));
    }

    // Get user from DB with password
    const user = await SuperAdmin.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return next(new ErrorResponse('Invalid current password', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in Super Admin
// @route   GET /api/v1/superadmin/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await SuperAdmin.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        role: user.role || 'superadmin'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Profile Details (Name, Email, Image)
// @route   PUT /api/v1/superadmin/updateprofile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    if (req.file) {
      fieldsToUpdate.profileImage = req.file.path;
    }

    const user = await SuperAdmin.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Dashboard Summary (Total Users, Active, Growth)
// @route   GET /api/v1/superadmin/dashboard/summary
// @access  Private (Super Admin)
exports.getSummary = async (req, res, next) => {
  try {
    const [adminCount, managerCount, salesCount, employeeCount] = await Promise.all([
      Admin.countDocuments(),
      Manager.countDocuments(),
      SalesExecutive.countDocuments(),
      Employee.countDocuments()
    ]);

    const totalUsers = adminCount + managerCount + salesCount + employeeCount;

    // Active Companies (Admins with active subscription)
    const activeCompanies = await Admin.countDocuments({
      subscriptionStatus: 'active'
    });

    // Active Users (Status is 'active')
    const [activeAdmins, activeManagers, activeSales, activeEmployees] = await Promise.all([
      Admin.countDocuments({ status: 'active' }),
      Manager.countDocuments({ status: 'active' }),
      SalesExecutive.countDocuments({ status: 'active' }),
      Employee.countDocuments({ status: 'active' })
    ]);

    const activeUsersCount = activeAdmins + activeManagers + activeSales + activeEmployees;

    // Calculate real monthly growth percentage (total users vs last month total)
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [prevAdmins, prevManagers, prevSales, prevEmployees] = await Promise.all([
      Admin.countDocuments({ createdAt: { $lt: startOfCurrentMonth } }),
      Manager.countDocuments({ createdAt: { $lt: startOfCurrentMonth } }),
      SalesExecutive.countDocuments({ createdAt: { $lt: startOfCurrentMonth } }),
      Employee.countDocuments({ createdAt: { $lt: startOfCurrentMonth } })
    ]);

    const totalUsersLastMonth = prevAdmins + prevManagers + prevSales + prevEmployees;
    let monthlyGrowthPercentage = 0;

    if (totalUsersLastMonth > 0) {
      monthlyGrowthPercentage = ((totalUsers - totalUsersLastMonth) / totalUsersLastMonth * 100).toFixed(1);
    } else if (totalUsers > 0) {
      monthlyGrowthPercentage = 100;
    }

    const data = {
      totalUsers,
      activeUsers: activeUsersCount, // Now reflects real active status
      activeCompanies,
      // Removed averageSessionTimeInMinutes
    };

    // Mask growth for staff
    if (req.user.role === 'superadmin_staff') {
      data.monthlyGrowthPercentage = 0;
    } else {
      data.monthlyGrowthPercentage = monthlyGrowthPercentage;
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Role Distribution
// @route   GET /api/v1/superadmin/dashboard/role-distribution
// @access  Private (Super Admin)
exports.getRoleDistribution = async (req, res, next) => {
  try {
    const [admins, managers, sales, employees] = await Promise.all([
      Admin.countDocuments(),
      Manager.countDocuments(),
      SalesExecutive.countDocuments(),
      Employee.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: admins + managers + sales + employees,
        admins,
        managers,
        sales,
        employees
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get User Growth Analysis
// @route   GET /api/v1/superadmin/dashboard/user-growth
// @access  Private (Super Admin)
exports.getUserGrowth = async (req, res, next) => {
  try {
    // Get period from query, default to 6 months
    const period = parseInt(req.query.period) || 6;
    let months = period;

    // Ensure valid period
    if (![6, 12].includes(months)) {
      months = 6;
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (months - 1));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Base count before start date
    const [baseAdmins, baseManagers, baseSales, baseEmployees] = await Promise.all([
      Admin.countDocuments({ createdAt: { $lt: startDate } }),
      Manager.countDocuments({ createdAt: { $lt: startDate } }),
      SalesExecutive.countDocuments({ createdAt: { $lt: startDate } }),
      Employee.countDocuments({ createdAt: { $lt: startDate } })
    ]);

    let runningTotal = baseAdmins + baseManagers + baseSales + baseEmployees;

    const aggregateGrowth = async (Model) => {
      return await Model.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        }
      ]);
    };

    const [adminGrowth, managerGrowth, salesGrowth, employeeGrowth] = await Promise.all([
      aggregateGrowth(Admin),
      aggregateGrowth(Manager),
      aggregateGrowth(SalesExecutive),
      aggregateGrowth(Employee)
    ]);

    // Merge logic
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthData = [];

    let currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= today || (currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear())) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const getCount = (data) => {
        const found = data.find(d => d._id.year === year && d._id.month === month);
        return found ? found.count : 0;
      };

      const newUsersThisMonth = getCount(adminGrowth) + getCount(managerGrowth) + getCount(salesGrowth) + getCount(employeeGrowth);
      runningTotal += newUsersThisMonth;

      growthData.push({
        month: monthNames[month - 1],
        users: runningTotal, // Cumulative
        newUsers: newUsersThisMonth, // Also useful
        fullDate: `${monthNames[month - 1]} ${year}`
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.status(200).json({
      success: true,
      data: growthData
    });
  } catch (err) {
    next(err);
  }
};



// @desc    Get Plan Distribution/Adoption
// @route   GET /api/v1/superadmin/dashboard/plan-distribution
// @access  Private (Super Admin)
exports.getPlanDistribution = async (req, res, next) => {
  try {
    const planDistribution = await Admin.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get all plans from Plan model for colors/details
    const allPlans = await Plan.find({});

    // Format data for pie chart
    const formattedData = planDistribution.map(item => {
      const plan = allPlans.find(p => p.name === item._id);

      let color = plan && plan.color ? plan.color : '#dadce0';
      const planName = item._id || 'No Plan';

      return {
        name: planName,
        value: item.count,
        color: color
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (err) {
    next(err);
  }
};



// @desc    Get Billing Stats (Total Revenue, Active Subs, etc.)
// @route   GET /api/v1/superadmin/billing/stats
// @access  Private (Super Admin)
exports.getBillingStats = async (req, res, next) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const activeSubscriptions = await Admin.countDocuments({
      subscriptionStatus: 'active'
    });

    // Get period from query, default to 6 months
    const period = parseInt(req.query.period) || 6;

    // Calculate date range
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (period - 1));
    startDate.setDate(1); // Start from the 1st of the starting month
    startDate.setHours(0, 0, 0, 0);

    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Generate all months in the range to ensure continuous data
    const revenueTrends = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= today || (currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear())) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // 1-indexed for comparison

      const existingData = revenueByMonth.find(item => item._id.year === year && item._id.month === month);

      revenueTrends.push({
        name: monthNames[month - 1], // + ` '${year.toString().substr(2)}`, // Optional: Add Year
        fullName: `${monthNames[month - 1]} ${year}`,
        revenue: existingData ? existingData.revenue : 0,
        count: existingData ? existingData.count : 0
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Calculate growth percentage (based on last 2 available months inc. current)
    let growthPercentage = 0;
    if (revenueTrends.length >= 2) {
      const currentMonth = revenueTrends[revenueTrends.length - 1].revenue;
      const previousMonth = revenueTrends[revenueTrends.length - 2].revenue;
      if (previousMonth > 0) {
        growthPercentage = ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);
      } else if (currentMonth > 0) {
        growthPercentage = 100; // 100% growth if prev was 0
      }
    }

    const pendingRefunds = await Payment.countDocuments({ status: 'refund_pending' }) || 0;
    const churnRate = 2.4; // Valid calculation requires historical snapshots

    const data = {
      activeSubscriptions,
      pendingRefunds,
      churnRate
    };

    // Mask revenue for staff
    if (req.user.role === 'superadmin_staff') {
      data.totalRevenue = 0;
      data.revenueTrends = [];
      data.growthPercentage = 0;
    } else {
      data.totalRevenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
      data.revenueTrends = revenueTrends;
      data.growthPercentage = parseFloat(growthPercentage);
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get All Transactions
// @route   GET /api/v1/superadmin/billing/transactions
// @access  Private (Super Admin)
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    console.log('getAllTransactions Query Params:', req.query);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Base match stage
    const matchStage = {};
    if (status && status !== 'all') {
      matchStage.status = status === 'success' ? 'paid' : status;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'admins',
          localField: 'adminId',
          foreignField: '_id',
          as: 'adminDetails'
        }
      },
      { $unwind: { path: '$adminDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'plans',
          localField: 'planId',
          foreignField: '_id',
          as: 'planDetails'
        }
      },
      { $unwind: { path: '$planDetails', preserveNullAndEmptyArrays: true } }
    ];

    // Search stage
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pipeline.push({
        $match: {
          $or: [
            { 'adminDetails.companyName': { $regex: safeSearch, $options: 'i' } },
            { razorpayOrderId: { $regex: safeSearch, $options: 'i' } }
          ]
        }
      });
    }

    // Final result with pagination
    const result = await Payment.aggregate([
      ...pipeline,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                adminId: {
                  _id: '$adminDetails._id',
                  name: '$adminDetails.name',
                  companyName: '$adminDetails.companyName',
                  email: '$adminDetails.email'
                },
                planId: {
                  _id: '$planDetails._id',
                  name: '$planDetails.name',
                  price: '$planDetails.price'
                },
                razorpayOrderId: 1,
                razorpayPaymentId: 1,
                amount: 1,
                currency: 1,
                status: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]);

    const transactions = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: transactions
    });
  } catch (err) {
    console.error('getAllTransactions Error:', err);
    next(err);
  }
};

// @desc    Get Subscription History (Admin plans with validity)
// @route   GET /api/v1/superadmin/subscription-history
// @access  Private (Super Admin)
exports.getSubscriptionHistory = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Base pipeline to get Admin data and calculate revenue
    const pipeline = [
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'adminId',
          as: 'payments'
        }
      },
      {
        $addFields: {
          paidPayments: {
            $filter: {
              input: '$payments',
              as: 'p',
              cond: { $eq: ['$$p.status', 'paid'] }
            }
          }
        }
      },
      {
        $project: {
          companyName: 1,
          subscriptionPlan: 1,
          subscriptionStatus: 1,
          subscriptionExpiry: 1,
          createdAt: 1,
          updatedAt: 1,
          totalRevenue: { $sum: '$paidPayments.amount' },
          lastPaymentDate: { $max: '$paidPayments.createdAt' }
        }
      }
    ];

    // Search Stage
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pipeline.push({
        $match: {
          $or: [
            { companyName: { $regex: safeSearch, $options: 'i' } },
            { subscriptionPlan: { $regex: safeSearch, $options: 'i' } }
          ]
        }
      });
    }

    // Status Filter Stage
    if (status && status !== 'All') {
      const today = new Date();
      if (status === 'Expiring') {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        pipeline.push({
          $match: {
            subscriptionStatus: 'active',
            subscriptionExpiry: {
              $gt: today,
              $lte: sevenDaysFromNow
            }
          }
        });
      } else {
        pipeline.push({
          $match: {
            subscriptionStatus: { $regex: `^${status}$`, $options: 'i' }
          }
        });
      }
    }

    // Sort Stage
    pipeline.push({ $sort: { subscriptionExpiry: -1 } });

    // Pagination using $facet
    const result = await Admin.aggregate([
      ...pipeline,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]);

    const admins = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    // Map to final format
    const history = admins.map(admin => {
      let daysRemaining = 0;
      if (admin.subscriptionExpiry) {
        const diff = new Date(admin.subscriptionExpiry) - new Date();
        daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }

      return {
        _id: admin._id,
        companyName: admin.companyName,
        planName: admin.subscriptionPlan,
        status: admin.subscriptionStatus,
        expiryDate: admin.subscriptionExpiry,
        startDate: admin.lastPaymentDate || admin.createdAt,
        daysRemaining,
        revenue: admin.totalRevenue || 0
      };
    });

    res.status(200).json({
      success: true,
      count: history.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: history
    });
  } catch (err) {
    next(err);
  }
};

const SupportTicket = require('../models/SupportTicket');
const SupportLead = require('../models/SupportLead');

// @desc    Get Pending Support Tickets
// @route   GET /api/v1/superadmin/dashboard/pending-support
// @access  Private (Super Admin)
exports.getPendingSupport = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const pendingTickets = await SupportTicket.find({
      status: { $in: ['Pending'] },
      isEscalatedToSuperAdmin: true
    })
      .populate('creator', 'name email')
      .populate('companyId', 'companyName')
      .sort('-createdAt')
      .limit(parseInt(limit));

    const totalPending = await SupportTicket.countDocuments({
      status: { $in: ['Pending'] },
      isEscalatedToSuperAdmin: true
    });

    res.status(200).json({
      success: true,
      count: pendingTickets.length,
      total: totalPending,
      data: pendingTickets
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Recent Inquiries
// @route   GET /api/v1/superadmin/dashboard/recent-inquiries
// @access  Private (Super Admin)
exports.getRecentInquiries = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const recentInquiries = await SupportLead.find()
      .sort('-createdAt')
      .limit(parseInt(limit));

    const totalInquiries = await SupportLead.countDocuments();
    const pendingInquiries = await SupportLead.countDocuments({
      status: { $in: ['new', 'pending'] }
    });

    res.status(200).json({
      success: true,
      count: recentInquiries.length,
      total: totalInquiries,
      pending: pendingInquiries,
      data: recentInquiries
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Get All SuperAdmin Staff
// @route   GET /api/v1/superadmin/staff
// @access  Private (SuperAdmin Root)
exports.getStaff = async (req, res, next) => {
  try {
    const { search } = req.query;
    console.log('GET /superadmin/staff - Search Query:', search);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Search query
    const matchQuery = { role: 'superadmin_staff' };
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      matchQuery.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { phoneNumber: { $regex: safeSearch, $options: 'i' } }
      ];
    }
    const total = await SuperAdmin.countDocuments(matchQuery);

    const staff = await SuperAdmin.find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    res.status(200).json({
      success: true,
      count: staff.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: staff
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create SuperAdmin Staff
// @route   POST /api/v1/superadmin/staff
// @access  Private (SuperAdmin Root)
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Validation
    if (!name || !email || !password) {
      return next(new ErrorResponse('Please provide name, email and password', 400));
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return next(new ErrorResponse('Please provide a valid email', 400));
    }

    // Password length validation
    if (password.length < 6) {
      return next(new ErrorResponse('Password must be at least 6 characters', 400));
    }

    const existingUser = await SuperAdmin.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Staff with this email already exists', 400));
    }

    const staff = await SuperAdmin.create({
      name,
      email,
      password,
      phoneNumber,
      role: 'superadmin_staff'
    });

    res.status(201).json({
      success: true,
      data: staff
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update SuperAdmin Staff
// @route   PUT /api/v1/superadmin/staff/:id
// @access  Private (SuperAdmin Root)
exports.updateStaff = async (req, res, next) => {
  try {
    let staff = await SuperAdmin.findById(req.params.id);

    if (!staff || staff.role !== 'superadmin_staff') {
      return next(new ErrorResponse('Staff not found', 404));
    }

    // Validation for update
    if (req.body.email) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(req.body.email)) {
        return next(new ErrorResponse('Please provide a valid email', 400));
      }

      // Check if email is already taken by another user
      const existingUser = await SuperAdmin.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return next(new ErrorResponse('Email is already in use', 400));
      }
    }

    if (req.body.name === '') {
      return next(new ErrorResponse('Name cannot be empty', 400));
    }

    if (req.body.password && req.body.password.length < 6) {
      return next(new ErrorResponse('Password must be at least 6 characters', 400));
    }

    staff = await SuperAdmin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Notify Staff
    try {
      if (req.user.id !== staff._id.toString()) { // Don't notify if self-update (though route is superadmin root only)
        await Notification.create({
          recipient: staff._id,
          sender: req.user.id,
          type: 'general',
          title: 'Profile Updated',
          message: 'Your account details have been updated by the Administrator.',
          link: '/profile'
        });
      }
    } catch (error) {
      console.error('Notification Error:', error);
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete SuperAdmin Staff
// @route   DELETE /api/v1/superadmin/staff/:id
// @access  Private (SuperAdmin Root)
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await SuperAdmin.findById(req.params.id);

    if (!staff || staff.role !== 'superadmin_staff') {
      return next(new ErrorResponse('Staff not found', 404));
    }

    await SuperAdmin.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
