const express = require('express');
const { register, login, logout, forgotPassword, resetPassword, getMe, updateDetails, updatePassword, checkSubscriptionStatus, sendOtp, verifyOtp, checkEmail, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const upload = require('../middleware/fileUpload');

const router = express.Router();

router.post('/register', register);
router.get('/check-email', checkEmail);
router.post('/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('[UPLOAD ERROR] Multer/Cloudinary Error:', err);
            return res.status(400).json({ success: false, error: err.message || 'File upload failed' });
        }
        if (!req.file) {
            console.error('[UPLOAD ERROR] No file in request');
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }
        console.log('[UPLOAD SUCCESS] File uploaded to Cloudinary:', req.file.path || req.file.secure_url);
        res.status(200).json({ success: true, url: req.file.path || req.file.secure_url });
    });
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
router.delete('/deleteaccount', protect, deleteAccount);
router.get('/subscription-status', protect, checkSubscriptionStatus);

module.exports = router;
