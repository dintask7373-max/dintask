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
    const admins = await Admin.find().populate('subscriptionPlanId');
    res.status(200).json({
      success: true,
      count: admins.length,
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

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return next(new ErrorResponse('Admin with this email already exists', 400));
    }

    // Default password if not provided
    const adminPassword = password || 'DinTask@123';

    const admin = await Admin.create({
      companyName,
      name,
      email,
      subscriptionPlan,
      subscriptionPlanId: req.body.subscriptionPlanId,
      password: adminPassword,
      subscriptionStatus: 'active'
    });

    // Send email to new admin
    const message = `Hello ${name},\n\nYour company account for ${companyName} has been provisioned at DinTask.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${adminPassword}\n\nPlease login at ${process.env.FRONTEND_URL || 'http://localhost:5173'} and change your password immediately.\n\nRegards,\nDinTask Team`;

    try {
      await sendEmail({
        email: admin.email,
        subject: 'Account Provisioned - DinTask',
        message
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
      return next(new ErrorResponse(`Admin not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Admin
// @route   DELETE /api/v1/superadmin/admins/:id
// @access  Private (Super Admin)
exports.deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return next(new ErrorResponse(`Admin not found with id of ${req.params.id}`, 404));
    }

    // Optionally: Delete related managers, employees, etc. 
    // For now just delete the admin account
    await Admin.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Admin Plan
// @route   PUT /api/v1/superadmin/admins/:id/plan
// @access  Private (Super Admin)
exports.updateAdminPlan = async (req, res, next) => {
  try {
    const { planId, planName } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        subscriptionPlanId: planId,
        subscriptionPlan: planName
      },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return next(new ErrorResponse(`Admin not found with id of ${req.params.id}`, 404));
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

    sendTokenResponse(superAdmin, 200, res);
  } catch (err) {
    next(err);
  }
};

// Helper to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken
    ? user.getSignedJwtToken()
    : jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d' // Hardcoded for now if model method doesn't exist, strictly following authController pattern or better
    });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
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
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/superadmin/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message
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
      data: user
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

    // Active Users (Logged in within last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsersCount = await LoginActivity.distinct('userId', {
      loginAt: { $gte: twentyFourHoursAgo },
      role: { $ne: 'super_admin' }
    }).then(ids => ids.length);

    // Mocking growth data
    const monthlyGrowthPercentage = 12.5;

    // Average Session Duration
    const avgSessionAgg = await LoginActivity.aggregate([
      { $match: { role: { $ne: 'super_admin' }, sessionDuration: { $exists: true } } },
      { $group: { _id: null, avgDuration: { $avg: '$sessionDuration' } } }
    ]);
    const averageSessionTimeInMinutes = avgSessionAgg.length > 0 ? Math.round(avgSessionAgg[0].avgDuration) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers: activeUsersCount,
        monthlyGrowthPercentage,
        averageSessionTimeInMinutes
      }
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
    // Mock data for chart
    const growthData = [
      { month: 'Jan', count: 10 },
      { month: 'Feb', count: 15 },
      { month: 'Mar', count: 25 },
      { month: 'Apr', count: 30 },
      { month: 'May', count: 45 },
      { month: 'Jun', count: 60 }
    ];

    res.status(200).json({
      success: true,
      data: growthData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Hourly Peak Activity
// @route   GET /api/v1/superadmin/dashboard/hourly-activity
// @access  Private (Super Admin)
exports.getHourlyActivity = async (req, res, next) => {
  try {
    const hourlyActivity = await LoginActivity.aggregate([
      { $match: { role: { $ne: 'super_admin' } } },
      {
        $group: {
          _id: { $hour: '$loginAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedActivity = Array.from({ length: 24 }, (_, i) => {
      const found = hourlyActivity.find(item => item._id === i);
      return { hour: i, count: found ? found.count : 0 };
    });

    res.status(200).json({
      success: true,
      data: formattedActivity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Recent Login Activity
// @route   GET /api/v1/superadmin/dashboard/recent-logins
// @access  Private (Super Admin)
exports.getRecentLogins = async (req, res, next) => {
  try {
    const logs = await LoginActivity.find({ role: { $ne: 'super_admin' } })
      .sort({ loginAt: -1 })
      .limit(10)
      .populate('userId', 'name email companyName');

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

const Payment = require('../models/Payment');

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

    const pendingRefunds = 0; // Placeholder for now
    const churnRate = 2.4; // Placeholder for now

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        activeSubscriptions,
        pendingRefunds,
        churnRate
      }
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
    const transactions = await Payment.find()
      .populate('adminId', 'name companyName email')
      .populate('planId', 'name price')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Subscription History (Admin plans with validity)
// @route   GET /api/v1/superadmin/subscription-history
// @access  Private (Super Admin)
exports.getSubscriptionHistory = async (req, res, next) => {
  try {
    const admins = await Admin.find()
      .populate('subscriptionPlanId')
      .sort('-subscriptionExpiry');

    const history = admins.map(admin => {
      let daysRemaining = 0;
      if (admin.subscriptionExpiry) {
        const today = new Date();
        const diff = admin.subscriptionExpiry - today;
        daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }

      return {
        _id: admin._id,
        companyName: admin.companyName,
        planName: admin.subscriptionPlan,
        status: admin.subscriptionStatus,
        expiryDate: admin.subscriptionExpiry,
        startDate: admin.updatedAt, // Assuming last update was renewal/activation
        daysRemaining,
        revenue: admin.subscriptionPlanId?.price || 0
      };
    });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
};
