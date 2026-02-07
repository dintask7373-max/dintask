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

// ... existing code ...

// @desc    Get pending join requests
// @route   GET /api/v1/admin/join-requests
// @access  Private (Admin)
exports.getJoinRequests = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const [employees, sales, managers] = await Promise.all([
      Employee.find({ adminId, status: 'pending' }),
      SalesExecutive.find({ adminId, status: 'pending' }),
      Manager.find({ adminId, status: 'pending' })
    ]);

    const requests = [...employees, ...sales, ...managers].sort((a, b) => b.createdAt - a.createdAt);
    console.log(`[DEBUG] Join Requests for Admin ${adminId}: Found ${requests.length} requests`);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve a join request
// @route   PUT /api/v1/admin/join-requests/:id/approve
// @access  Private (Admin)
exports.approveJoinRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // We need to know the role to find the collection

    if (!role) {
      return next(new ErrorResponse('Please provide user role', 400));
    }

    const models = {
      employee: Employee,
      sales_executive: SalesExecutive,
      manager: Manager
    };

    if (!models[role]) {
      return next(new ErrorResponse('Invalid role', 400));
    }

    const user = await models[role].findById(id);

    if (!user) {
      return next(new ErrorResponse('Request not found', 404));
    }

    // Verify this user matches the authorized admin
    if (user.adminId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to approve this request', 403));
    }

    user.status = 'active';
    await user.save();

    // Check plan limits (Optional but recommended)
    // const limitCheck = await checkUserLimit(req.user.id);
    // if (!limitCheck.allowed) ... (Handled optimally before approval or we let it slide for now)

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject a join request
// @route   PUT /api/v1/admin/join-requests/:id/reject
// @access  Private (Admin)
exports.rejectJoinRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) return next(new ErrorResponse('Please provide user role', 400));

    const models = {
      employee: Employee,
      sales_executive: SalesExecutive,
      manager: Manager
    };

    const user = await models[role].findById(id);

    if (!user) return next(new ErrorResponse('Request not found', 404));

    if (user.adminId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Determine whether to delete or just mark rejected
    // Usually rejected requests are deleted or kept for record.
    // Deleting for now to keep it clean.
    await models[role].findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a team member directly (Active)
// @route   POST /api/v1/admin/add-member
// @access  Private (Admin)
exports.addTeamMember = async (req, res, next) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;
    const adminId = req.user.id;

    // Check Limit
    // const checkUserLimit = require('../utils/checkUserLimit'); // Ensure imported at top
    // const limitCheck = await checkUserLimit(adminId);
    // if (!limitCheck.allowed) return next(new ErrorResponse(limitCheck.error, 403));

    const models = {
      employee: Employee,
      sales_executive: SalesExecutive,
      manager: Manager
    };

    if (!models[role]) return next(new ErrorResponse('Invalid role', 400));

    const userExists = await models[role].findOne({ email });
    if (userExists) return next(new ErrorResponse('User already exists', 400));

    const user = await models[role].create({
      name,
      email,
      password,
      role,
      adminId,
      phoneNumber,
      status: 'active', // Direct add is active
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: user
    });
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
