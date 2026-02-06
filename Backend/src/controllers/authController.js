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
  manager: Manager,
  admin: Admin,
  superadmin: SuperAdmin
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

    if (role && models[role]) {
      // Check specific model
      user = await models[role].findOne({ email }).select('+password');
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
    const user = await req.user.populate('subscriptionPlanId');

    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'admin') {
      userData.subscriptionPlan = user.subscriptionPlan;
      userData.planDetails = user.subscriptionPlanId;
      userData.subscriptionStatus = user.subscriptionStatus;
      userData.subscriptionExpiry = user.subscriptionExpiry;
    }

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Create token with role included
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  let userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  // Include plan details for Admins
  if (user.role === 'admin') {
    // We need to populate it if not already
    await user.populate('subscriptionPlanId');
    userData.subscriptionPlan = user.subscriptionPlan;
    userData.planDetails = user.subscriptionPlanId;
  }

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};
