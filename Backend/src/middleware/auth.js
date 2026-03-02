const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const Partner = require('../models/Partner');

const models = {
  employee: Employee,
  sales_executive: SalesExecutive,
  sales: SalesExecutive, // Support normalized frontend role
  manager: Manager,
  admin: Admin,
  partner: Partner,
  super_admin: SuperAdmin, // Support legacy/db role
  superadmin: SuperAdmin,
  superadmin_staff: SuperAdmin
};

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'null' || token === 'undefined') {
        console.error('[Auth] Token is invalid/null/undefined string');
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('[Auth Debug] Decoded:', decoded);

      let role = decoded.role;

      // Normalize role
      if (role) {
        role = role.toLowerCase();
        if (role === 'super_admin') role = 'superadmin';
        if (role === 'sales') role = 'sales_executive';
      }

      let UserModel = models[role];

      // Special handling for superadmin variants if not found in map directly
      if (!UserModel) {
        if (role === 'superadmin' || role === 'super_admin' || role === 'superadmin_staff') {
          UserModel = SuperAdmin;
        }
      }

      if (!UserModel) {
        // Fallback: Try to find user in all models if role mapping is confusing
        // This is expensive but safer for debugging
        console.warn(`[Auth] Role ${role} not found in models map. Trying fallback search.`);
        // For now, fail to strict 401
        console.error(`[Auth] Invalid role in token: ${decoded.role}`);
        return res.status(401).json({ success: false, message: 'Invalid role in token' });
      }

      req.user = await UserModel.findById(decoded.id);

      if (!req.user) {
        console.error(`[Auth] User not found for ID: ${decoded.id} with role: ${decoded.role}`);
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Normalize role on req.user for downstream consistency
      let userRole = req.user.role;
      if (userRole === 'super_admin') req.user.role = 'superadmin';
      if (userRole === 'sales_executive') req.user.role = 'sales';

      next();
    } catch (err) {
      console.error('Auth Middleware Error:', err.message);
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`[AUTH DEBUG] User: ${req.user?._id}, Role: '${req.user?.role}' (len: ${req.user?.role?.length}), Required: ${JSON.stringify(roles)}`);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
