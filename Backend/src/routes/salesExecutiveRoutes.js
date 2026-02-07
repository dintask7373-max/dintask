const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMe, updateDetails } = require('../controllers/salesExecutiveController');

const router = express.Router();

router.use(protect);
router.use(authorize('sales', 'manager', 'admin', 'superadmin'));

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);

module.exports = router;
