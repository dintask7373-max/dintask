const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    getStats,
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
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
    getRecentLogins,
    updateAdminPlan,
    getBillingStats,
    getAllTransactions,
    getSubscriptionHistory
} = require('../controllers/superAdminController');
const upload = require('../middleware/upload');

const {
    getPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan
} = require('../controllers/planController');

const router = express.Router();

router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// ONLY Super Admin can access
router.use(protect);
router.use(authorize('superadmin'));

router.put('/changepassword', changePassword);
router.put('/updateprofileimage', upload.single('image'), updateProfileImage);
router.get('/me', getMe);
router.put('/updateprofile', upload.single('image'), updateProfile);
router.get('/stats', getStats);
router.get('/admins', getAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);
router.put('/admins/:id/plan', updateAdminPlan);

// Plan Management
router.route('/plans')
    .get(getPlans)
    .post(createPlan);

router.route('/plans/:id')
    .get(getPlan)
    .put(updatePlan)
    .delete(deletePlan);

// Dashboard Routes
router.get('/dashboard/summary', getSummary);
router.get('/dashboard/role-distribution', getRoleDistribution);
router.get('/dashboard/user-growth', getUserGrowth);
router.get('/dashboard/hourly-activity', getHourlyActivity);
router.get('/dashboard/recent-logins', getRecentLogins);

// Billing & History
router.get('/billing/stats', getBillingStats);
router.get('/billing/transactions', getAllTransactions);
router.get('/subscription-history', getSubscriptionHistory);

module.exports = router;
