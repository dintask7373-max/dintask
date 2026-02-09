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

    getPlanDistribution,
    updateAdminPlan,
    getBillingStats,
    getAllTransactions,
    getSubscriptionHistory,
    getPendingSupport,
    getRecentInquiries,
    logout,
    getStaff,
    createStaff,
    updateStaff,
    deleteStaff
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
router.get('/logout', logout);

// ONLY Super Admin can access (Root superadmin or Staff)
router.use(protect);
router.use(authorize('superadmin', 'superadmin_staff'));

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

router.get('/dashboard/plan-distribution', getPlanDistribution);
router.get('/dashboard/pending-support', getPendingSupport);
router.get('/dashboard/recent-inquiries', getRecentInquiries);

// Staff Management
router.route('/staff')
    .get(getStaff)
    .post(createStaff);

router.route('/staff/:id')
    .put(updateStaff)
    .delete(deleteStaff);

// Billing & History
router.get('/billing/stats', getBillingStats);
router.get('/billing/transactions', getAllTransactions);
router.get('/subscription-history', getSubscriptionHistory);

module.exports = router;
