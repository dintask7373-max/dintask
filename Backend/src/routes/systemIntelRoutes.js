const express = require('express');
const {
    getSystemIntel,
    updateSystemIntel,
    seedSystemIntel
} = require('../controllers/systemIntelController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', getSystemIntel);

// Protected routes
router.put('/:role', protect, authorize('superadmin', 'superadmin_staff'), updateSystemIntel);
router.post('/seed', protect, authorize('superadmin', 'superadmin_staff'), seedSystemIntel);

module.exports = router;
