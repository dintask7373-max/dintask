const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

const checkUserLimit = require('../utils/checkUserLimit');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const Plan = require('../models/Plan');
const Notification = require('../models/Notification');
const Otp = require('../models/Otp');
const smsService = require('../utils/smsService');
const Partner = require('../models/Partner');
const PartnerDocument = require('../models/PartnerDocument');

const models = {
  employee: Employee,
  sales_executive: SalesExecutive,
  sales: SalesExecutive, // Added for normalized role support
  manager: Manager,
  admin: Admin,
  superadmin: SuperAdmin,
  super_admin: SuperAdmin,
  superadmin_staff: SuperAdmin,
  partner: Partner
};

// Helper to get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  try {
    console.log('[TOKEN DEBUG] sendTokenResponse started');
    // Normalize role for frontend consistency
    let normalizedRole = user.role;
    if (user.role === 'sales_executive') normalizedRole = 'sales';
    if (user.role === 'super_admin') normalizedRole = 'superadmin';

    console.log('[TOKEN DEBUG] Generating JWT...');
    const token = jwt.sign({ id: user._id, role: normalizedRole }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    console.log('[TOKEN DEBUG] JWT generated');

    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
      adminId: user.adminId,
      status: user.status,
      agreementStatus: user.agreementStatus
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

    console.log('[TOKEN DEBUG] Sending response...');
    res.status(statusCode).json({
      success: true,
      token,
      user: userData
    });
    console.log('[TOKEN DEBUG] Response sent');
  } catch (err) {
    console.error('[TOKEN ERROR] Error in sendTokenResponse:', err);
    throw err; // Re-throw to be caught by login's catch
  }
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, adminId, companyName, partnerType, referralCode } = req.body;
    const partnerData = req.body; // Use req.body directly since frontend sends flat structure

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
      const teamSize = parseInt(req.body.teamSize) || 1;
      const freePlan = await Plan.findOne({ price: 0 });
      
      if (freePlan) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (freePlan.duration || 30));

        extraData = {
          subscriptionPlan: freePlan.name,
          subscriptionPlanId: freePlan._id,
          subscriptionStatus: 'active',
          subscriptionExpiry: expiryDate,
          teamSize: 1, // Start with only the admin themselves count? No, teamSize should be current staff count.
          userLimit: teamSize // This is the requested capacity
        };
      } else {
        extraData = {
          teamSize: 1,
          userLimit: teamSize
        };
      }

      // Referral Logic: Link Partner if ref code provided
      if (referralCode) {
        const partner = await Partner.findOne({ referralCode, status: 'active' });
        if (partner) {
          extraData.partnerId = partner._id;
        }
      }
    }

    // Partner Registration Logic
    if (role === 'partner') {
      if (!partnerType) {
        return next(new ErrorResponse('Please provide partner type (Individual/Company)', 400));
      }

      // Mandatory fields check
      if (partnerType === 'Individual') {
        if (!partnerData.fullName || !partnerData.panNumber) {
          return next(new ErrorResponse('Full Name and PAN Number are required for individual partners', 400));
        }
      } else {
        if (!partnerData.companyName || !partnerData.companyPan || !partnerData.authorizedPersonName) {
          return next(new ErrorResponse('Company Name, PAN and Authorized Person Name are required for company partners', 400));
        }
      }

      if (!partnerData.address) {
        return next(new ErrorResponse('Address is required', 400));
      }

      if (!partnerData.accountNumber || !partnerData.ifscCode || !partnerData.accountHolderName) {
        return next(new ErrorResponse('Bank details (Account Holder, Number, IFSC) are required', 400));
      }

      // Check if bank account number already exists
      const accountExists = await Partner.findOne({ 'bankDetails.accountNumber': partnerData.accountNumber });
      if (accountExists) {
        return next(new ErrorResponse('Bank account number already registered with another partner', 400));
      }

      // Extract and nest bank details
      const bankDetails = {
        accountHolderName: partnerData.accountHolderName,
        accountNumber: partnerData.accountNumber,
        ifscCode: partnerData.ifscCode,
        bankName: partnerData.bankName,
        branchName: partnerData.branchName
      };

      extraData = {
        partnerType,
        ...partnerData,
        bankDetails,
        name: partnerType === 'Individual' ? (partnerData.fullName || req.body.name) : (partnerData.companyName || req.body.name),
        status: 'pending' // Wait for admin approval
      };
    }

    // Check if email is already taken for THIS role (or any role if we want global uniqueness)
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return next(new ErrorResponse('Email already registered for this role', 400));
    }

    // Check if phone number is already taken (if provided)
    if (req.body.phoneNumber || req.body.phone) {
      const phone = req.body.phoneNumber || req.body.phone;
      const phoneExists = await UserModel.findOne({ $or: [{ phoneNumber: phone }, { phone: phone }] });
      if (phoneExists) {
        return next(new ErrorResponse('Phone number already exists', 400));
      }
    }

    // Create user in specific collection
    const user = await UserModel.create({
      name: role === 'partner' ? (partnerType === 'Individual' ? req.body.fullName : req.body.companyName) : name,
      email,
      password,
      phoneNumber: req.body.phoneNumber || req.body.phone,
      role,
      adminId: role !== 'admin' && role !== 'superadmin' && role !== 'partner' ? adminId : undefined,
      companyName: role === 'admin' ? companyName : (role === 'partner' && partnerType === 'Company' ? req.body.companyName : undefined),
      ...extraData
    });

    // Notify Superadmins about new Admin or Partner registration
    if (role === 'admin' || role === 'partner') {
      try {
        const superAdmins = await SuperAdmin.find({ role: { $in: ['superadmin', 'superadmin_staff', 'super_admin'] } });

        const uniqueRecipients = new Map();
        superAdmins.forEach(sa => uniqueRecipients.set(sa._id.toString(), sa._id));

        const notifications = Array.from(uniqueRecipients.values()).map(recipientId => ({
          recipient: recipientId,
          sender: user._id,
          type: 'general',
          title: role === 'admin' ? 'New Admin Registered' : 'New Partner Registered',
          message: role === 'admin'
            ? `A new company "${companyName}" has registered with admin ${name}`
            : `A new partner "${user.name}" (${partnerType}) has registered and is pending approval.`,
          link: role === 'admin' ? '/superadmin/admins' : '/superadmin/partners'
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      } catch (notifyErr) {
        console.error('Superadmin Notification Error:', notifyErr);
      }

      // [NEW] Handle Partner Documents if provided
      if (role === 'partner' && req.body.documents && Array.isArray(req.body.documents)) {
        try {
          const docPromises = req.body.documents.map(doc => {
            return PartnerDocument.create({
              partnerId: user._id,
              documentType: doc.type,
              fileUrl: doc.url,
              status: 'pending'
            });
          });
          await Promise.all(docPromises);
        } catch (docErr) {
          console.error('Partner Document Creation Error:', docErr);
        }
      }
    }

    // Notify Workspace Admin about new team member registration
    if (['manager', 'sales_executive', 'employee'].includes(role) && adminId) {
      try {
        await Notification.create({
          recipient: adminId,
          sender: user._id,
          adminId: adminId,
          type: 'team_registration',
          title: 'New Team Member Registered',
          message: `A new ${role.replace('_', ' ')} "${name}" has registered and is pending your approval.`,
          link: '/hr/join-requests'
        });
      } catch (notifyErr) {
        console.error('Admin Registration Notification Error:', notifyErr);
      }
    }

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

    // Set status to active on registration (auto-login)
    user.status = 'active';
    await user.save();

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

    // Check if user is active (Case-insensitive)
    const normalizedStatus = user.status?.toLowerCase() || 'pending';
    console.log(`[LOGIN DEBUG] Checking status for ${user.email}. Role: ${user.role}, Status: '${user.status}' (normalized: ${normalizedStatus})`);

    if (normalizedStatus === 'pending' && user.role !== 'partner') {
      console.log('[LOGIN DEBUG] Blocking pending user');
      return res.status(403).json({ success: false, error: 'Your account is pending approval.' });
    }
    if (normalizedStatus === 'rejected') {
      console.log('[LOGIN DEBUG] Blocking rejected user');
      return res.status(403).json({ success: false, error: 'Your account request has been rejected.' });
    }
    if (normalizedStatus === 'disabled') {
      console.log('[LOGIN DEBUG] Blocking disabled user');
      return res.status(403).json({ success: false, error: 'Your account has been disabled. Please contact support.' });
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

      // Check if admin/company is suspended
      if (admin.subscriptionStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          role: user.role === 'sales_executive' ? 'sales' : user.role,
          error: 'Account suspended by Superadmin'
        });
      }
    }

    // Check if user is an Admin and if they are suspended
    if (user.role === 'admin' && user.subscriptionStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        isSuspended: true,
        role: 'admin',
        error: 'Account suspended by Superadmin'
      });
    }

    // DO NOT overwrite account status with 'active' session status
    // user.status = 'active';
    // await user.save();

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // DO NOT overwrite account status with 'inactive' session status
    // if (req.user) {
    //   req.user.status = 'inactive';
    //   await req.user.save();
    // }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
      role: user.role,
      adminId: user.adminId,
      status: user.status,
      agreementStatus: user.agreementStatus
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

    // Check if phone number is being updated and if it's already taken
    if (phoneNumber) {
      const phoneExists = await UserModel.findOne({ phoneNumber });
      if (phoneExists && phoneExists._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Phone number already exists', 400));
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

    // Notify Admin about profile update (Security/Activity alert)
    try {
      const targetAdminId = req.user.role === 'admin' ? req.user.id : req.user.adminId;
      if (targetAdminId) {
        await Notification.create({
          recipient: targetAdminId,
          sender: req.user.id,
          adminId: targetAdminId,
          type: 'security_alert',
          title: 'Profile Details Updated',
          message: `${req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)} "${user.name}" updated their profile details.`,
          link: '/hr/directory'
        });
      }
    } catch (err) { console.error('Profile Update Notification Error:', err); }

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

    // Notify Admin about Password Update (Security Alert)
    try {
      const targetAdminId = req.user.role === 'admin' ? req.user.id : req.user.adminId;
      if (targetAdminId) {
        await Notification.create({
          recipient: targetAdminId,
          sender: req.user.id,
          adminId: targetAdminId,
          type: 'security_alert',
          title: 'Security Alert: Password Changed',
          message: `The password for ${req.user.role} "${user.name}" was recently changed. If this wasn't expected, please investigate.`,
          link: '/hr/directory'
        });
      }
    } catch (err) { console.error('Password Update Notification Error:', err); }

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

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return next(new ErrorResponse('Please provide an email', 400));
    }

    let user;
    let UserModel;

    // Search across all models if role not provided, else search specific
    if (role && models[role]) {
      UserModel = models[role];
      user = await UserModel.findOne({ email });
    } else {
      for (const [r, Model] of Object.entries(models)) {
        user = await Model.findOne({ email });
        if (user) {
          UserModel = Model;
          break;
        }
      }
    }

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    // Save with reset token and expire
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontendUrl = rawFrontendUrl.split(',')[0].trim();
    // We append role to query so frontend knows which endpoint to hit if needed, or just centralize
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}?role=${user.role}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #3b82f6; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You are receiving this email because you (or someone else) has requested the reset of a password for your <strong>DinTask</strong> account.</p>
          
          <p>Please click the button below to reset your password. This link will expire in <strong>10 minutes</strong>.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
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
        subject: 'Password Reset Request - DinTask',
        message,
        html
      });

      res.status(200).json({
        success: true,
        data: 'Email sent'
      });
    } catch (err) {
      console.error('Reset Email Error:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { role } = req.query;

    if (!password) {
      return next(new ErrorResponse('Please provide a new password', 400));
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    let user;
    let UserModel;

    if (role && models[role]) {
      UserModel = models[role];
      user = await UserModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
    } else {
      // Search all
      for (const [r, Model] of Object.entries(models)) {
        user = await Model.findOne({
          resetPasswordToken,
          resetPasswordExpire: { $gt: Date.now() }
        });
        if (user) {
          UserModel = Model;
          break;
        }
      }
    }

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};


// @desc    Send OTP for login
// @route   POST /api/v1/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res, next) => {
  try {
    const { phone, role } = req.body;

    if (!phone || !role) {
      return next(new ErrorResponse('Please provide phone number and role', 400));
    }

    // Role mapping
    const roleMap = {
      'sales': 'sales_executive',
      'superadmin': 'superadmin'
    };
    const dbRole = roleMap[role] || role;

    if (!models[dbRole]) {
      return next(new ErrorResponse('Invalid role', 400));
    }

    const UserModel = models[dbRole];

    // Check if user exists
    // Models use 'phoneNumber' field
    const user = await UserModel.findOne({ phoneNumber: phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Account not found. Please register first.'
      });
    }

    // Check status (Normalized)
    const normalizedStatus = user.status?.toLowerCase() || 'pending';
    if (normalizedStatus === 'pending') {
      return res.status(403).json({ success: false, error: 'Your account is pending approval.' });
    }
    if (normalizedStatus === 'rejected') {
      return res.status(403).json({ success: false, error: 'Your account has been rejected.' });
    }
    if (normalizedStatus === 'disabled') {
      return res.status(403).json({ success: false, error: 'Your account has been disabled. Please contact support.' });
    }

    // Test numbers logic (from RukkooIn)
    const testNumbers = ['9009925021', '6261096283', '9685974247', '9752275626', '8889948896', '7047716600', '6263322405'];
    const isTestNumber = testNumbers.includes(phone);

    // Generate OTP
    const otp = isTestNumber ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Update OTP
    // Default expiration is 10 mins in schema
    await Otp.findOneAndUpdate(
      { phone },
      { phone, otp, tempData: { role: dbRole } }, // upsert true handles creation
      { upsert: true, new: true }
    );

    // Send SMS
    if (!isTestNumber) {
      const smsResult = await smsService.sendOTP(phone, otp);
      if (!smsResult.success) {
        return next(new ErrorResponse(`SMS failed: ${smsResult.error}`, 500));
      }
    } else {
      console.log(`🧪 Test Number: ${phone} - OTP: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600 // 10 minutes
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP and Login
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, role } = req.body;

    if (!phone || !otp || !role) {
      return next(new ErrorResponse('Please provide phone, otp and role', 400));
    }

    // Role mapping
    const roleMap = {
      'sales': 'sales_executive',
      'superadmin': 'superadmin'
    };
    const dbRole = roleMap[role] || role;

    // 1. Verify OTP
    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
      return next(new ErrorResponse('OTP expired or invalid. Request again.', 400));
    }

    if (otpRecord.otp !== otp) {
      return next(new ErrorResponse('Invalid OTP', 400));
    }

    // Check expiration explicitly (though index handles deletion, slight race condition possible)
    if (otpRecord.expiresAt < Date.now()) {
      return next(new ErrorResponse('OTP expired', 400));
    }

    // 2. Find User
    const UserModel = models[dbRole];
    if (!UserModel) return next(new ErrorResponse('Invalid role configuration', 500));

    const user = await UserModel.findOne({ phoneNumber: phone });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Reuse login checks logic (Normalized)
    const normalizedStatus = user.status?.toLowerCase() || 'pending';
    if (normalizedStatus === 'pending') {
      return res.status(403).json({ success: false, error: 'Your account is pending approval.' });
    }
    if (normalizedStatus === 'rejected') {
      return res.status(403).json({ success: false, error: 'Your account has been rejected.' });
    }
    if (normalizedStatus === 'disabled') {
      return res.status(403).json({ success: false, error: 'Your account has been disabled. Please contact support.' });
    }

    // Check subscription for team members
    // Copy logic from login function
    const teamMemberRoles = ['employee', 'manager', 'sales_executive'];
    if (teamMemberRoles.includes(user.role)) {
      const adminId = user.adminId;
      if (adminId) {
        const admin = await Admin.findById(adminId);
        if (admin) {
          const now = new Date();
          const expiryDate = new Date(admin.subscriptionExpiry);
          if (expiryDate < now) {
            return res.status(403).json({
              success: false,
              subscriptionExpired: true,
              error: 'Organization subscription expired.',
              expiryDate: admin.subscriptionExpiry
            });
          }
        }
      }
    }

    // 3. Cleanup OTP
    await Otp.deleteOne({ phone });

    // 4. Login Success
    user.status = 'active';
    await user.save();

    await sendTokenResponse(user, 200, res);

  } catch (err) {
    next(err);
  }
};

// @desc    Check if email exists
// @route   GET /api/v1/auth/check-email
// @access  Public
exports.checkEmail = async (req, res, next) => {
  try {
    const { email, role } = req.query;

    if (!email) {
      return next(new ErrorResponse('Please provide an email', 400));
    }

    let user;
    let foundRole = null;

    if (role && models[role]) {
      user = await models[role].findOne({ email });
      if (user) foundRole = role;
    } else {
      // Check across all models
      for (const [r, Model] of Object.entries(models)) {
        user = await Model.findOne({ email });
        if (user) {
          foundRole = r;
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      exists: !!user,
      role: foundRole || null
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account
// @route   DELETE /api/v1/auth/deleteaccount
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const UserModel = models[req.user.role];

    if (!UserModel) {
      return next(new ErrorResponse('Invalid user role', 400));
    }

    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Notify Admin before deletion (if team member)
    const teamMemberRoles = ['employee', 'manager', 'sales_executive', 'sales'];
    if (teamMemberRoles.includes(req.user.role) && user.adminId) {
      try {
        await Notification.create({
          recipient: user.adminId,
          sender: user._id,
          adminId: user.adminId,
          type: 'security_alert',
          title: 'Account Deleted',
          message: `${req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)} "${user.name}" has deleted their account permanently.`,
          link: '/hr/directory'
        });
      } catch (notifyErr) {
        console.error('Account Deletion Notification Error:', notifyErr);
      }
    }

    // Perform Hard Delete
    await UserModel.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
