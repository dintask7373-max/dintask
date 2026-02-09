const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

const checkUserLimit = require('../utils/checkUserLimit');
const ErrorResponse = require('../utils/errorResponse');

const Plan = require('../models/Plan');

const models = {
  employee: Employee,
  sales_executive: SalesExecutive,
  sales: SalesExecutive, // Added for normalized role support
  manager: Manager,
  admin: Admin,
  superadmin: SuperAdmin
};

// Helper to get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Normalize role for frontend consistency
  let normalizedRole = user.role;
  if (user.role === 'sales_executive') normalizedRole = 'sales';
  if (user.role === 'super_admin') normalizedRole = 'superadmin';

  // Create token with normalized role
  const token = jwt.sign({ id: user._id, role: normalizedRole }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  let userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: normalizedRole
  };

  // Include plan details for Admins
  if (user.role === 'admin') {
    // We need to populate it if not already
    await user.populate('subscriptionPlanId');
    userData.subscriptionPlan = user.subscriptionPlan;
    userData.subscriptionPlanId = user.subscriptionPlanId?._id;
    userData.planDetails = user.subscriptionPlanId;
    userData.subscriptionStatus = user.subscriptionStatus;
    userData.subscriptionExpiry = user.subscriptionExpiry;

    // Check if subscription has expired
    const now = new Date();
    const expiryDate = new Date(user.subscriptionExpiry);
    userData.subscriptionExpired = expiryDate < now;
  }

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, adminId, companyName } = req.body;

    if (!role || !models[role]) {
      return next(new ErrorResponse('Please provide a valid role', 400));
    }

    // Check user limit if creating restricted roles
    if (['manager', 'sales_executive', 'employee'].includes(role)) {
      if (!adminId) {
        return next(new ErrorResponse('Please provide an Admin ID for this user', 400));
      }

      const limitCheck = await checkUserLimit(adminId);
      if (!limitCheck.allowed) {
        return next(new ErrorResponse(limitCheck.error, 403));
      }
    }

    const UserModel = models[role];
    let extraData = {};

    // If registering as Admin, assign the Free Plan (Amount 0)
    if (role === 'admin') {
      const freePlan = await Plan.findOne({ price: 0 });
      if (freePlan) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (freePlan.duration || 30));

        extraData = {
          subscriptionPlan: freePlan.name,
          subscriptionPlanId: freePlan._id,
          subscriptionStatus: 'active',
          subscriptionExpiry: expiryDate
        };
      }
    }

    // Create user in specific collection
    const user = await UserModel.create({
      name,
      email,
      password,
      role,
      adminId: role !== 'admin' && role !== 'superadmin' ? adminId : undefined,
      companyName: role === 'admin' ? companyName : undefined,
      ...extraData
    });

    // If status is pending, do NOT login immediately
    if (user.status === 'pending') {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please wait for admin approval.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    }

    await sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    let user;
    let foundRole = role;

    // Map frontend 'sales' role to backend 'sales_executive'
    const roleMap = {
      'sales': 'sales_executive',
      'superadmin': 'superadmin' // just in case
    };
    const dbRole = roleMap[role] || role;

    if (dbRole && models[dbRole]) {
      // Check specific model
      user = await models[dbRole].findOne({ email }).select('+password');
      foundRole = dbRole;
    } else {
      // Search all collections if role not provided
      for (const [r, Model] of Object.entries(models)) {
        user = await Model.findOne({ email }).select('+password');
        if (user) {
          foundRole = r;
          break;
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if user is active
    console.log(`[LOGIN DEBUG] Checking status for ${user.email}. Role: ${user.role}, Status: '${user.status}'`);

    if (user.status === 'pending') {
      console.log('[LOGIN DEBUG] Blocking pending user');
      return res.status(403).json({ success: false, error: 'Your account is pending approval from your administrator.' });
    }
    if (user.status === 'rejected') {
      console.log('[LOGIN DEBUG] Blocking rejected user');
      return res.status(403).json({ success: false, error: 'Your account request has been rejected.' });
    }

    // Check admin subscription for team members
    const teamMemberRoles = ['employee', 'manager', 'sales_executive'];
    if (teamMemberRoles.includes(user.role)) {
      const adminId = user.adminId;

      if (!adminId) {
        return res.status(403).json({
          success: false,
          subscriptionExpired: true,
          error: 'No associated admin found. Please contact support.'
        });
      }

      const admin = await Admin.findById(adminId);

      if (!admin) {
        return res.status(403).json({
          success: false,
          subscriptionExpired: true,
          error: 'Associated admin not found. Please contact support.'
        });
      }

      // Check if admin subscription has expired
      const now = new Date();
      const expiryDate = new Date(admin.subscriptionExpiry);

      if (expiryDate < now) {
        return res.status(403).json({
          success: false,
          subscriptionExpired: true,
          error: 'Your organization\'s subscription has expired. Please contact your administrator to renew the plan.',
          expiryDate: admin.subscriptionExpiry
        });
      }
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let user = req.user;

    // Only populate subscriptionPlanId for admins
    if (user.role === 'admin') {
      user = await user.populate('subscriptionPlanId');
    }

    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'admin') {
      userData.subscriptionPlan = user.subscriptionPlan;
      userData.subscriptionPlanId = user.subscriptionPlanId?._id;
      userData.planDetails = user.subscriptionPlanId;
      userData.subscriptionStatus = user.subscriptionStatus;
      userData.subscriptionExpiry = user.subscriptionExpiry;

      // Check if subscription has expired
      const now = new Date();
      const expiryDate = new Date(user.subscriptionExpiry);
      userData.subscriptionExpired = expiryDate < now;
    }

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const { name, email, phoneNumber } = req.body;

    // Find user by ID and Role from the request (set by protect middleware)
    const UserModel = models[req.user.role];

    if (!UserModel) {
      return next(new ErrorResponse('Invalid user role', 400));
    }

    // Check if email is being updated and if it's already taken
    if (email) {
      const emailExists = await UserModel.findOne({ email });
      if (emailExists && emailExists._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Email already exists', 400));
      }
    }

    const fieldsToUpdate = {
      name: name || req.user.name,
      email: email || req.user.email,
      phoneNumber: phoneNumber || req.user.phoneNumber
    };

    const user = await UserModel.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
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

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse('Please provide current and new password', 400));
    }

    const UserModel = models[req.user.role];

    // Get user with password
    const user = await UserModel.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return next(new ErrorResponse('Invalid current password', 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Check subscription status for team members
// @route   GET /api/v1/auth/subscription-status
// @access  Private (Team Members)
exports.checkSubscriptionStatus = async (req, res, next) => {
  try {
    const teamMemberRoles = ['employee', 'manager', 'sales'];

    // Only team members need this check
    if (!teamMemberRoles.includes(req.user.role)) {
      return res.status(200).json({
        success: true,
        subscriptionActive: true,
        message: 'Not applicable for this role'
      });
    }

    const adminId = req.user.adminId;

    if (!adminId) {
      return res.status(403).json({
        success: false,
        subscriptionActive: false,
        subscriptionExpired: true,
        message: 'No associated admin found'
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(403).json({
        success: false,
        subscriptionActive: false,
        subscriptionExpired: true,
        message: 'Associated admin not found'
      });
    }

    const now = new Date();
    const expiryDate = new Date(admin.subscriptionExpiry);

    if (expiryDate < now) {
      return res.status(403).json({
        success: false,
        subscriptionActive: false,
        subscriptionExpired: true,
        message: 'Organization subscription has expired',
        expiryDate: admin.subscriptionExpiry
      });
    }

    // Subscription is active
    res.status(200).json({
      success: true,
      subscriptionActive: true,
      expiryDate: admin.subscriptionExpiry
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
