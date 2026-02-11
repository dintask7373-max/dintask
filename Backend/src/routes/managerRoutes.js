const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMe, getEmployees, getEmployeePerformanceMetrics } = require('../controllers/managerController');

const router = express.Router();

router.use(protect);
router.use(authorize('manager', 'admin', 'superadmin'));

router.get('/me', getMe);
router.get('/employees', getEmployees);
router.get('/performance/employees', getEmployeePerformanceMetrics);

module.exports = router;
