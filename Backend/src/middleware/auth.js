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
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.role || !models[decoded.role]) {
      throw new Error('Invalid token payload: role missing or invalid');
    }

    const UserModel = models[decoded.role];
    req.user = await UserModel.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // NORMALIZE ROLES: Ensure downstream middleware sees normalized roles
    // This allows both frontend (normalized) and backend (db) roles to work
    if (req.user.role === 'super_admin') {
      req.user.role = 'superadmin';
    }
    if (req.user.role === 'sales_executive') {
      req.user.role = 'sales';
    }

    next();
  } catch (err) {
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
