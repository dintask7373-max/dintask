const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get manager profile
// @route   GET /api/v1/manager/me
// @access  Private (Manager)
exports.getMe = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: manager
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all employees (for manager view)
// @route   GET /api/v1/manager/employees
// @access  Private (Manager)
exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (err) {
    next(err);
  }
};
