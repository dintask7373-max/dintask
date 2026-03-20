const Plan = require('../models/Plan');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all plans
// @route   GET /api/v1/superadmin/plans
// @access  Private (Super Admin / Admin)
exports.getPlans = async (req, res, next) => {
  try {
    let query = {};

    // If user is Admin, do not show the free plan (amount 0)
    if (req.user && req.user.role === 'admin') {
      query.price = { $ne: 0 };
    }

    let plans = await Plan.find(query).lean();

    // Fetch System Settings for dynamic pricing
    const SystemSettings = require('../models/SystemSettings');
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = { pricePerMember: 50, annualDiscount: 20 };
    }

    // Override plan.price with dynamic price for frontend display
    plans = plans.map(plan => {
      if (plan.price === 0) {
        return plan; // Free plan remains free
      }
      const durationMultiplier = (plan.duration || 30) / 30;
      let calculatedPrice = settings.pricePerMember * durationMultiplier;
      
      if (plan.duration >= 365) {
        calculatedPrice = calculatedPrice - (calculatedPrice * (settings.annualDiscount / 100));
      }
      plan.price = Math.ceil(calculatedPrice);
      return plan;
    });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single plan
// @route   GET /api/v1/superadmin/plans/:id
// @access  Private (Super Admin)
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return next(new ErrorResponse(`Plan not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new plan
// @route   POST /api/v1/superadmin/plans
// @access  Private (Super Admin)
exports.createPlan = async (req, res, next) => {
  try {
    const { name, price, userLimit, duration } = req.body;

    // Validation
    if (!name || duration === undefined) {
      return next(new ErrorResponse('Please provide name and duration', 400));
    }

    if (name.trim() === '') {
      return next(new ErrorResponse('Plan name cannot be empty', 400));
    }

    if (duration < 1) {
      return next(new ErrorResponse('Duration must be at least 1', 400));
    }

    // Default price to 1 to mark it as paid, or 0 if explicitly passed as 0
    req.body.price = price === 0 ? 0 : 1;

    // Default userLimit for backward compatibility if needed
    if (userLimit === undefined) {
        req.body.userLimit = 0;
    }

    // Check for existing plan with the same name
    const existingPlan = await Plan.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existingPlan) {
      return next(new ErrorResponse('A plan with this name already exists', 400));
    }

    // Check if trying to create a free plan
    if (req.body.price === 0) {
      const existingFreePlan = await Plan.findOne({ price: 0 });
      if (existingFreePlan) {
        return next(new ErrorResponse('You can only create one free plan (Amount 0).', 400));
      }
    }

    // Generate random color if not provided
    if (!req.body.color) {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      req.body.color = randomColor;
    }

    const plan = await Plan.create(req.body);

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update plan
// @route   PUT /api/v1/superadmin/plans/:id
// @access  Private (Super Admin)
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!plan) {
      return next(new ErrorResponse(`Plan not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete plan
// @route   DELETE /api/v1/superadmin/plans/:id
// @access  Private (Super Admin)
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return next(new ErrorResponse(`Plan not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
