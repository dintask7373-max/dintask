const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, deleteUser, forgotPassword, resetPassword, registerAdmin } = require('../controllers/adminController');
const { getPlans } = require('../controllers/planController');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Only Admin and Super Admin can access these routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/users', getAllUsers);
router.get('/plans', getPlans);
router.delete('/users/:id', deleteUser);

module.exports = router;
