const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

const models = {
  employee: Employee,
  sales_executive: SalesExecutive,
  sales: SalesExecutive, // Support normalized frontend role
  manager: Manager,
  admin: Admin,
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
<<<<<<< HEAD
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user based on ID first, assuming we know the role from the token or can infer it
      // However, our models are separate. We must rely on the role in the token to pick the right model.
      // If the token has 'superadmin' but the user is 'superadmin_staff', we need to check SuperAdmin model.
=======

      if (!token || token === 'null' || token === 'undefined') {
        console.error('[Auth] Token is invalid/null/undefined string');
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('[Auth Debug] Decoded:', decoded);
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

      let role = decoded.role;

      // Normalize role
      if (role) {
        role = role.toLowerCase();
        if (role === 'super_admin') role = 'superadmin';
        if (role === 'sales') role = 'sales_executive';
      }

      let UserModel = models[role];

<<<<<<< HEAD
      // Special handling for superadmin variants if not found in map directly (which they should be now)
=======
      // Special handling for superadmin variants if not found in map directly
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
      if (!UserModel) {
        if (role === 'superadmin' || role === 'super_admin' || role === 'superadmin_staff') {
          UserModel = SuperAdmin;
        }
      }

      if (!UserModel) {
<<<<<<< HEAD
=======
        // Fallback: Try to find user in all models if role mapping is confusing
        // This is expensive but safer for debugging
        console.warn(`[Auth] Role ${role} not found in models map. Trying fallback search.`);
        // For now, fail to strict 401
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
        console.error(`[Auth] Invalid role in token: ${decoded.role}`);
        return res.status(401).json({ success: false, message: 'Invalid role in token' });
      }

      req.user = await UserModel.findById(decoded.id);

      if (!req.user) {
        console.error(`[Auth] User not found for ID: ${decoded.id} with role: ${decoded.role}`);
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Normalize role on req.user for downstream consistency
<<<<<<< HEAD
      // But keep original DB role if needed?
      // For authorize(), we need it to match what we expect.
      // If DB has 'sales_executive', we map to 'sales'.
      // If DB has 'super_admin', we map to 'superadmin'.
      // If DB has 'superadmin_staff', we keep it 'superadmin_staff'.

=======
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
      let userRole = req.user.role;
      if (userRole === 'super_admin') req.user.role = 'superadmin';
      if (userRole === 'sales_executive') req.user.role = 'sales';

      next();
    } catch (err) {
<<<<<<< HEAD
      console.error('Auth Middleware Error:', err);
=======
      console.error('Auth Middleware Error:', err.message);
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
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
