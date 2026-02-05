const Employee = require('../models/Employee');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get current logged in employee profile
// @route   GET /api/v1/employee/me
// @access  Private (Employee)
exports.getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee profile
// @route   PUT /api/v1/employee/updatedetails
// @access  Private (Employee)
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phoneNumber: req.body.phoneNumber
    };

    const employee = await Employee.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
};
