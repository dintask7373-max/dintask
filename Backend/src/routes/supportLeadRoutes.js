const express = require('express');
const { submitLead, getLeads } = require('../controllers/supportLeadController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route to submit a lead
router.post('/lead', submitLead);

// Protected route for Super Admin to view leads
router.get('/admin/support-leads', protect, authorize('superadmin', 'superadmin_staff'), getLeads);
router.get('/admin/support-leads/:id', protect, authorize('superadmin', 'superadmin_staff'), require('../controllers/supportLeadController').getLead);
router.put('/admin/support-leads/:id', protect, authorize('superadmin', 'superadmin_staff'), require('../controllers/supportLeadController').updateLead);

module.exports = router;
