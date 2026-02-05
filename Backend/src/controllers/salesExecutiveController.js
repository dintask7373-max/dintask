const SalesExecutive = require('../models/SalesExecutive');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get current sales executive profile
// @route   GET /api/v1/sales/me
// @access  Private (Sales Executive)
exports.getMe = async (req, res, next) => {
  try {
    const sales = await SalesExecutive.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: sales
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update sales executive details
// @route   PUT /api/v1/sales/updatedetails
// @access  Private (Sales Executive)
exports.updateDetails = async (req, res, next) => {
  try {
    const sales = await SalesExecutive.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: sales
    });
  } catch (err) {
    next(err);
  }
};
