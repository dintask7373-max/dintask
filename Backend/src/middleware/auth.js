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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user based on ID first, assuming we know the role from the token or can infer it
      // However, our models are separate. We must rely on the role in the token to pick the right model.
      // If the token has 'superadmin' but the user is 'superadmin_staff', we need to check SuperAdmin model.

      let role = decoded.role;

      // Handle legacy/normalized roles from token if necessary
      if (role === 'superadmin' || role === 'super_admin') role = 'superadmin';
      if (role === 'sales') role = 'sales_executive';

      let UserModel = models[role];

      // If role is superadmin_staff, it uses SuperAdmin model too
      if (role === 'superadmin_staff') UserModel = SuperAdmin;

      if (!UserModel) {
        // If we can't determine model from token role, try all (fallback)
        // But for now, let's assume token role is correct enough to pick a model
        // If 'superadmin' in token, we check SuperAdmin model.
        // If the user is actually 'superadmin_staff' in DB, SuperAdmin model will still find them by ID.
        // So this is fine.
        if (role === 'superadmin') UserModel = SuperAdmin;
      }

      if (!UserModel) {
        return res.status(401).json({ success: false, message: 'Invalid role in token' });
      }

      req.user = await UserModel.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Normalize role on req.user for downstream consistency
      // But keep original DB role if needed?
      // For authorize(), we need it to match what we expect.
      // If DB has 'sales_executive', we map to 'sales'.
      // If DB has 'super_admin', we map to 'superadmin'.
      // If DB has 'superadmin_staff', we keep it 'superadmin_staff'.

      let userRole = req.user.role;
      if (userRole === 'super_admin') req.user.role = 'superadmin';
      if (userRole === 'sales_executive') req.user.role = 'sales';

      next();
    } catch (err) {
      console.error('Auth Middleware Error:', err);
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
