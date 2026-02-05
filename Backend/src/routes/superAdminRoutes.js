const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStats, getAdmins } = require('../controllers/superAdminController');

const router = express.Router();

// ONLY Super Admin can access
router.use(protect);
router.use(authorize('super_admin'));

router.get('/stats', getStats);
router.get('/admins', getAdmins);

module.exports = router;
