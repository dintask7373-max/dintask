const express = require('express');
const { register, login, logout, forgotPassword, resetPassword, getMe, updateDetails, updatePassword, checkSubscriptionStatus } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/subscription-status', protect, checkSubscriptionStatus);

module.exports = router;
