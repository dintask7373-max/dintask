const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
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
exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
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
