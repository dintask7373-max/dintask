const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMe, updateDetails } = require('../controllers/employeeController');

const router = express.Router();

// All routes under this router will be protected and for employees only
router.use(protect);
router.use(authorize('employee', 'manager', 'admin', 'superadmin'));

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);

module.exports = router;
