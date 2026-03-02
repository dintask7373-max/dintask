const express = require('express');
const { register, login, logout, forgotPassword, resetPassword, getMe, updateDetails, updatePassword, checkSubscriptionStatus, sendOtp, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const upload = require('../middleware/fileUpload');

const router = express.Router();

router.post('/register', register);
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'Please upload a file' });
    res.status(200).json({ success: true, url: req.file.path || req.file.secure_url });
});
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/subscription-status', protect, checkSubscriptionStatus);

module.exports = router;
