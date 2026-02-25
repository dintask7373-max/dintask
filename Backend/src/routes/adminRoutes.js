const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    getManagers,
    getEmployees,
    getSalesExecutives,
    getCRMStats, // Added
    deleteUser,
<<<<<<< HEAD
=======
    updateUser, // Added
    sendAnnouncement, // Added
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

    forgotPassword,
    resetPassword,
    registerAdmin,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    addTeamMember,
    getSubscriptionLimitStatus,
    getDashboardStats,
    getRevenueChart,
    getSalesPipelineChart,
    getProjectHealthChart,
<<<<<<< HEAD
    getActionableLists
=======
    getActionableLists,
    getReportsStats
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
} = require('../controllers/adminController');
const { getPlans } = require('../controllers/planController');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Only Authenticated users can access these
router.use(protect);

// Shared route for Chat/Directory - now accessible by Managers/Sales/Employees etc.
router.get('/users', getAllUsers);

// Routes for Admin, Super Admin, and Manager
router.use(authorize('admin', 'superadmin', 'manager'));
router.get('/plans', getPlans);
router.get('/subscription-limit', getSubscriptionLimitStatus);
router.get('/dashboard-stats', getDashboardStats);
router.get('/dashboard-charts/revenue', getRevenueChart);
router.get('/dashboard-charts/pipeline', getSalesPipelineChart);
router.get('/dashboard-charts/projects', getProjectHealthChart);
router.get('/dashboard-actionable-lists', getActionableLists);
<<<<<<< HEAD

// Restricted Admin and Super Admin only routes
router.use(authorize('admin', 'superadmin'));
router.delete('/users/:id', deleteUser);
=======
router.get('/reports/stats', getReportsStats);

// Restricted Admin and Super Admin only routes
router.use(authorize('admin', 'superadmin'));
router.route('/users/:id')
    .put(updateUser)
    .delete(deleteUser);

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
router.get('/managers', getManagers);
router.get('/employees', getEmployees);
router.get('/sales-executives', getSalesExecutives);
router.get('/crm/stats', getCRMStats); // Added CRM Stats route

// Join Requests
router.get('/join-requests', getJoinRequests);
router.put('/join-requests/:id/approve', approveJoinRequest);
router.put('/join-requests/:id/reject', rejectJoinRequest);

// Add Member Direct
router.post('/add-member', addTeamMember);

<<<<<<< HEAD
=======
// Announcements
router.post('/announcement', sendAnnouncement);

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
module.exports = router;
