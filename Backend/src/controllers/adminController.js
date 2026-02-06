const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken'); // Needed for token response logic if we duplicate it

// @desc    Register a new Admin (Self-service)
// @route   POST /api/v1/admin/register
// @access  Public
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, companyName, phoneNumber } = req.body;

    // Check if user exists
    const userExists = await Admin.findOne({ email });

    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    // Create user
    const user = await Admin.create({
      name,
      email,
      password,
      companyName,
      phoneNumber,
      role: 'admin',
      subscriptionStatus: 'active' // Default to active for now
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users across all collections
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const [employees, sales, managers, admins, superadmins] = await Promise.all([
      Employee.find(),
      SalesExecutive.find(),
      Manager.find(),
      Admin.find(),
      SuperAdmin.find()
    ]);

    const allUsers = [...employees, ...sales, ...managers, ...admins, ...superadmins];

    res.status(200).json({
      success: true,
      count: allUsers.length,
      data: allUsers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a user from any collection
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // Role is needed to know which collection to delete from

    if (!role) {
      return next(new ErrorResponse('Please provide user role for deletion', 400));
    }

    const models = {
      employee: Employee,
      sales_executive: SalesExecutive,
      manager: Manager,
      admin: Admin,
      super_admin: SuperAdmin
    };

    const user = await models[role].findByIdAndDelete(id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${id} in ${role}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password (Admin)
// @route   POST /api/v1/admin/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await Admin.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/admin/resetpassword/${resetToken}`;

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

// @desc    Reset Password (Admin)
// @route   PUT /api/v1/admin/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await Admin.findOne({
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

// Helper to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
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
