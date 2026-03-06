const express = require('express');
const router = express.Router();
const {
    createTestimonial,
    getAllTestimonials,
    getApprovedTestimonials,
    updateTestimonialStatus,
    toggleHighlight,
    deleteTestimonial
} = require('../controllers/testimonialController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/', createTestimonial); // Submit new testimonial
router.get('/approved', getApprovedTestimonials); // Get approved list for landing page

// Protected routes (SuperAdmin only)
router.use(protect);
router.use(authorize('superadmin', 'superadmin_staff'));

router.get('/', getAllTestimonials); // Get all (pending + approved)
router.put('/:id/status', updateTestimonialStatus); // Approve/Reject
router.put('/:id/highlight', toggleHighlight); // Toggle highlight
router.delete('/:id', deleteTestimonial); // Delete

module.exports = router;
