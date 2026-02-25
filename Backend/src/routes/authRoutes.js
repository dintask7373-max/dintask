const express = require('express');
<<<<<<< HEAD
const { register, login, logout, forgotPassword, resetPassword, getMe, updateDetails, updatePassword, checkSubscriptionStatus } = require('../controllers/authController');
=======
const { register, login, logout, forgotPassword, resetPassword, getMe, updateDetails, updatePassword, checkSubscriptionStatus, sendOtp, verifyOtp } = require('../controllers/authController');
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
<<<<<<< HEAD
=======
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/subscription-status', protect, checkSubscriptionStatus);

module.exports = router;
