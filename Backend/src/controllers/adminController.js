const Employee = require('../models/Employee');
const SalesExecutive = require('../models/SalesExecutive');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken'); // Needed for token response logic if we duplicate it

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
