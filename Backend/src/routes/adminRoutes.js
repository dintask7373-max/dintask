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

<<<<<<< HEAD
// Admins, Managers, and Super Admins can access these routes
router.use(protect);
router.use(authorize('admin', 'superadmin', 'manager'));
=======
// Only Authenticated users can access these
router.use(protect);

// Shared route for Chat/Directory - now accessible by Managers/Sales/Employees etc.
router.get('/users', getAllUsers);

// Only Admin and Super Admin can access these routes
router.use(authorize('admin', 'superadmin'));
>>>>>>> 940cb77fb658d7d72391569f7f58be5ec344cac3

router.get('/plans', getPlans);
router.get('/subscription-limit', getSubscriptionLimitStatus);
router.delete('/users/:id', deleteUser);

// Join Requests
router.get('/join-requests', getJoinRequests);
router.put('/join-requests/:id/approve', approveJoinRequest);
router.put('/join-requests/:id/reject', rejectJoinRequest);

// Add Member Direct
router.post('/add-member', addTeamMember);

module.exports = router;
