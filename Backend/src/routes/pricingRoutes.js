const express = require('express');
const {
    getLandingPagePlans,
    createPricingPlan,
    updatePricingPlan,
    deletePricingPlan
} = require('../controllers/pricingController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getLandingPagePlans)
    .post(protect, authorize('superadmin', 'super_admin'), createPricingPlan);

router
    .route('/:id')
    .put(protect, authorize('superadmin', 'super_admin'), updatePricingPlan)
    .delete(protect, authorize('superadmin', 'super_admin'), deletePricingPlan);

module.exports = router;
