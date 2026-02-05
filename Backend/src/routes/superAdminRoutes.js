const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    getStats,
    getAdmins,
    login,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfileImage,
    getMe,
    updateProfile
} = require('../controllers/superAdminController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// ONLY Super Admin can access
router.use(protect);
router.use(authorize('super_admin'));

router.put('/changepassword', changePassword);
router.put('/updateprofileimage', upload.single('image'), updateProfileImage);
router.get('/stats', getStats);
router.get('/admins', getAdmins);

module.exports = router;
