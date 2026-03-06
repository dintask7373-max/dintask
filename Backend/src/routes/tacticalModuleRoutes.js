const express = require('express');
const router = express.Router();
const {
    getModules,
    updateModule
} = require('../controllers/tacticalModuleController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getModules);
router.put('/:moduleId', protect, authorize('superadmin', 'super_admin'), upload.single('image'), updateModule);

module.exports = router;
