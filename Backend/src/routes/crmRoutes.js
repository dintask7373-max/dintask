const express = require('express');
const {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  requestProjectConversion,
  approveProject,
  getPendingProjects,
  getSalesExecutives,
<<<<<<< HEAD
  bulkDeleteLeads
=======
  bulkDeleteLeads,
  getSalesReport
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
} = require('../controllers/crmController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Middleware to use correct user model for auth based on route is tricky
// Assuming 'protect' middleware handles Admin and SalesExec correctly and populates req.user

router
  .route('/')
  .get(protect, authorize('admin', 'sales'), getLeads)
  .post(protect, authorize('admin', 'sales'), createLead);

router.route('/sales-executives').get(protect, authorize('admin', 'sales'), getSalesExecutives);

router.route('/bulk-delete').post(protect, authorize('admin', 'sales'), bulkDeleteLeads);

router.route('/pending-projects').get(protect, authorize('admin', 'sales'), getPendingProjects);

<<<<<<< HEAD
=======
router.route('/reports').get(protect, authorize('admin', 'sales'), getSalesReport);

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
router
  .route('/:id')
  .put(protect, authorize('admin', 'sales'), updateLead)
  .delete(protect, authorize('admin', 'sales'), deleteLead);

router.route('/:id/assign').put(protect, authorize('admin'), assignLead);

router.route('/:id/request-project').put(protect, authorize('sales', 'admin'), requestProjectConversion);

router.route('/:id/approve-project').post(protect, authorize('admin'), approveProject);

module.exports = router;
