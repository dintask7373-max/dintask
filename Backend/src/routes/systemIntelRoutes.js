const express = require('express');
const {
    getSystemIntel,
    updateSystemIntel,
    seedSystemIntel
} = require('../controllers/systemIntelController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route to fetch intel for the Welcome page
router.get('/', getSystemIntel);

// Protected routes for Super Admin
router.use(protect);
router.use(authorize('superadmin'));

router.post('/seed', seedSystemIntel);
router.put('/:role', updateSystemIntel);

module.exports = router;
