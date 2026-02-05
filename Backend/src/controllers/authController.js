const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

const models = {
  employee: Employee,
  sales_executive: SalesExecutive,
  manager: Manager,
  admin: Admin,
  super_admin: SuperAdmin
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!role || !models[role]) {
      return res.status(400).json({ success: false, error: 'Please provide a valid role' });
    }

    const UserModel = models[role];

    // Create user in specific collection
    const user = await UserModel.create({
      name,
      email,
      password,
      role // role is still kept in schema for convenience in auth middleware logic
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token with role included
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
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
