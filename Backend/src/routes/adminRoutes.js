const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    deleteUser,
    forgotPassword,
    resetPassword,
    registerAdmin,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    addTeamMember,
    getSubscriptionLimitStatus
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

// Restricted Admin and Super Admin only routes
router.use(authorize('admin', 'superadmin'));
router.delete('/users/:id', deleteUser);

// Join Requests
router.get('/join-requests', getJoinRequests);
router.put('/join-requests/:id/approve', approveJoinRequest);
router.put('/join-requests/:id/reject', rejectJoinRequest);

// Add Member Direct
router.post('/add-member', addTeamMember);

module.exports = router;
