const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get system stats
// @route   GET /api/v1/superadmin/stats
// @access  Private (Super Admin)
exports.getStats = async (req, res, next) => {
  try {
    // Logic for system wide stats
    res.status(200).json({
      success: true,
      message: 'System stats only for Super Admin'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Maintain Admins (Create/Delete/Update Admins specifically)
// @route   GET /api/v1/superadmin/admins
// @access  Private (Super Admin)
exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (err) {
    next(err);
  }
};
