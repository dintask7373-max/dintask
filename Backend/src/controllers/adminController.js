const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken'); // Needed for token response logic if we duplicate it
const checkUserLimit = require('../utils/checkUserLimit');

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

// @desc    Get all users across all collections (Workspace-specific)
// @route   GET /api/v1/admin/users
// @access  Private
exports.getAllUsers = async (req, res, next) => {
  try {
    let adminId;

    // If seeker is admin, adminId is their own ID
    if (req.user.role === 'admin') {
      adminId = req.user.id;
    } else {
      // If seeker is manager/sales/employee, adminId is stored in their profile
      const models = {
        manager: Manager,
        sales: SalesExecutive,
        sales_executive: SalesExecutive,
        employee: Employee
      };

      const userModel = models[req.user.role];
      if (!userModel) {
        return next(new ErrorResponse('User type not supported for directory', 400));
      }

      const userProfile = await userModel.findById(req.user.id);
      if (!userProfile) {
        return next(new ErrorResponse('User profile not found', 404));
      }
      adminId = userProfile.adminId;
    }

    if (!adminId) {
      return next(new ErrorResponse('Workspace ID not found', 400));
    }

    console.log(`[DEBUG] getAllUsers - Seeker: ${req.user.role}, Workspace Admin ID: ${adminId}`);

    // Fetch Admin, Managers, Sales, Employees for this workspace
    const [admin, employees, sales, managers] = await Promise.all([
      Admin.findById(adminId).select('name email avatar role companyName'),
      Employee.find({ adminId, status: 'active' }).select('name email avatar role'),
      SalesExecutive.find({ adminId, status: 'active' }).select('name email avatar role'),
      Manager.find({ adminId, status: 'active' }).select('name email avatar role')
    ]);

    // Format admin to look like other users and include in list
    const usersList = [];
    if (admin) {
      usersList.push({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        role: 'admin'
      });
    }

    usersList.push(...employees, ...sales, ...managers);

    res.status(200).json({
      success: true,
      count: usersList.length,
      data: usersList
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Managers with pagination and search
// @route   GET /api/v1/admin/managers
// @access  Private (Admin)
exports.getManagers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let adminId;
    if (req.user.role === 'admin') {
      adminId = req.user.id;
    } else {
      // For now, restrict to Admin only or handle other roles if needed
      return next(new ErrorResponse('Not authorized to view managers', 403));
    }

    const matchQuery = {
      adminId: new mongoose.Types.ObjectId(adminId),
      role: 'manager'
    };

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await Manager.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            // Lookup for teams/project counts or other related info can be added here if needed
            {
              $lookup: {
                from: 'teams',
                localField: '_id',
                foreignField: 'managerId',
                as: 'managedTeams'
              }
            },
            {
              $addFields: {
                activeTeamsCount: { $size: '$managedTeams' }
              }
            },
            { $project: { password: 0, managedTeams: 0 } }
          ]
        }
      }
    ]);

    const managers = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: managers.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: managers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Employees with pagination and search
// @route   GET /api/v1/admin/employees
// @access  Private (Admin)
exports.getEmployees = async (req, res, next) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let adminId;
    if (req.user.role === 'admin') {
      adminId = req.user.id;
    } else {
      return next(new ErrorResponse('Not authorized to view employees', 403));
    }

    const matchQuery = {
      adminId: new mongoose.Types.ObjectId(adminId),
      role: 'employee'
    };

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await Employee.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { password: 0 } }
          ]
        }
      }
    ]);

    const employees = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: employees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Sales Executives with pagination and search
// @route   GET /api/v1/admin/sales-executives
// @access  Private (Admin)
exports.getSalesExecutives = async (req, res, next) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let adminId;
    if (req.user.role === 'admin') {
      adminId = req.user.id;
    } else {
      return next(new ErrorResponse('Not authorized to view sales executives', 403));
    }

    const matchQuery = {
      adminId: new mongoose.Types.ObjectId(adminId),
      role: 'sales_executive'
    };

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await SalesExecutive.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { password: 0 } }
          ]
        }
      }
    ]);

    const salesExecutives = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: salesExecutives.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: salesExecutives
    });
  } catch (err) {
    next(err);
  }
};

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
      manager: Manager
    };

    if (!models[role]) {
      return next(new ErrorResponse('Invalid role or cannot delete admin/superadmin', 400));
    }

    const user = await models[role].findById(id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${id} in ${role}`, 404));
    }

    // Verify user belongs to THIS admin's workspace
    if (user.adminId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this user - different workspace', 403));
    }

    await models[role].findByIdAndDelete(id);

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

    // Check plan limits before approval
    const limitCheck = await checkUserLimit(req.user.id);
    if (!limitCheck.allowed) {
      return next(new ErrorResponse(limitCheck.error, 403));
    }

    user.status = 'active';
    await user.save();

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
    const checkUserLimit = require('../utils/checkUserLimit'); // Ensure imported at top
    const limitCheck = await checkUserLimit(adminId);
    if (!limitCheck.allowed) return next(new ErrorResponse(limitCheck.error, 403));

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
      managerId: req.body.managerId,
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

// @desc    Get subscription limit status
// @route   GET /api/v1/admin/subscription-limit
// @access  Private (Admin)
exports.getSubscriptionLimitStatus = async (req, res, next) => {
  try {
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.adminId;
    if (!adminId) {
      return next(new ErrorResponse('Workspace ID not found for this user', 400));
    }
    const checkUserLimit = require('../utils/checkUserLimit');

    const limitStatus = await checkUserLimit(adminId);

    res.status(200).json({
      success: true,
      data: limitStatus
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
