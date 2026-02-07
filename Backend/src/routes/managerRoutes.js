const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMe, getEmployees } = require('../controllers/managerController');

const router = express.Router();

router.use(protect);
router.use(authorize('manager', 'admin', 'superadmin'));

router.get('/me', getMe);
router.get('/employees', getEmployees);

module.exports = router;
