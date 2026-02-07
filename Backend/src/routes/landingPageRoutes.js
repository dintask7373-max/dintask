const express = require('express');
const router = express.Router();
const landingPageController = require('../controllers/landingPageController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - anyone can view
router.get('/', landingPageController.getAllContent);
router.get('/:section', landingPageController.getContentBySection);

// Protected routes - superadmin only
router.put('/:section', protect, authorize('superadmin'), landingPageController.updateContentBySection);
router.delete('/:section', protect, authorize('superadmin'), landingPageController.deleteContentBySection);
router.post('/initialize', protect, authorize('superadmin'), landingPageController.initializeDefaultContent);

module.exports = router;
