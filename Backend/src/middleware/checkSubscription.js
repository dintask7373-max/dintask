const Admin = require('../models/Admin');

/**
 * Middleware to check if the admin's subscription is active
 * This is applied to employee, manager, and sales executive routes
 * to ensure team members can't access the system if admin's plan has expired
 */
exports.checkAdminSubscription = async (req, res, next) => {
  try {
    // Only apply this check for team members (not admins or superadmins)
    const teamMemberRoles = ['employee', 'manager', 'sales', 'sales_executive'];

    if (!teamMemberRoles.includes(req.user.role)) {
      // Admin and SuperAdmin bypass this check
      return next();
    }

    // Get the adminId from the authenticated user
    const adminId = req.user.adminId;

    if (!adminId) {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: 'No associated admin found. Please contact support.'
      });
    }

    // Fetch admin details
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: 'Associated admin not found. Please contact support.'
      });
    }

    // Check if subscription has expired
    const now = new Date();
    const expiryDate = new Date(admin.subscriptionExpiry);

    if (expiryDate < now) {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: 'Your organization\'s subscription has expired. Please contact your administrator to renew the plan.',
        expiryDate: admin.subscriptionExpiry
      });
    }

    // Subscription is active, proceed
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};
