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

// @desc    Get all employees (for manager view - workspace-specific)
// @route   GET /api/v1/manager/employees
// @access  Private (Manager)
exports.getEmployees = async (req, res, next) => {
  try {
    // Get manager's adminId
    const manager = await Manager.findById(req.user.id);
    if (!manager) {
      return next(new ErrorResponse('Manager not found', 404));
    }

    // Fetch only employees from THIS manager's workspace
    const employees = await Employee.find({
      adminId: manager.adminId,
      status: 'active'  // Only active employees
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (err) {
    next(err);
  }
};
