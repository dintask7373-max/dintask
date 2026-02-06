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
    updateProfile,
    getSummary,
    getRoleDistribution,
    getUserGrowth,
    getHourlyActivity,
    getRecentLogins
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

// Dashboard Routes
router.get('/dashboard/summary', getSummary);
router.get('/dashboard/role-distribution', getRoleDistribution);
router.get('/dashboard/user-growth', getUserGrowth);
router.get('/dashboard/hourly-activity', getHourlyActivity);
router.get('/dashboard/recent-logins', getRecentLogins);

module.exports = router;
