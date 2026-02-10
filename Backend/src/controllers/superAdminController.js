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
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]);

    const admins = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

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

    const admin = await Admin.create({
      companyName,
      name,
      email,
      subscriptionPlan,
      subscriptionPlanId: req.body.subscriptionPlanId,
      password: adminPassword,
      subscriptionStatus: 'active',
      subscriptionExpiry
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}?role=${user.role}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

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

    const data = {
      totalUsers,
      activeUsers: activeUsersCount,
      activeCompanies,
      averageSessionTimeInMinutes
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
      return {
        name: item._id || 'No Plan',
        value: item.count,
        // Assign colors based on plan names
        color: item._id === 'Starter' ? '#94a3b8' :
          item._id === 'Pro Team' ? '#3b82f6' :
            item._id === 'Business' ? '#8b5cf6' :
              item._id === 'Enterprise' ? '#7c3aed' : '#cbd5e1'
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

    // Get monthly revenue trends for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: sixMonthsAgo }
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

    // Format revenue trends for frontend chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrends = revenueByMonth.map(item => ({
      name: monthNames[item._id.month - 1],
      revenue: item.revenue,
      count: item.count
    }));

    // Calculate growth percentage
    let growthPercentage = 0;
    if (revenueTrends.length >= 2) {
      const currentMonth = revenueTrends[revenueTrends.length - 1].revenue;
      const previousMonth = revenueTrends[revenueTrends.length - 2].revenue;
      if (previousMonth > 0) {
        growthPercentage = ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);
      }
    }

    const pendingRefunds = 0; // Placeholder for now
    const churnRate = 2.4; // Placeholder for now

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

    staff = await SuperAdmin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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
