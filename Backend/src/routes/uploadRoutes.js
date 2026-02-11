const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');
const { protect, authorize } = require('../middleware/auth');

// POST /api/v1/upload
<<<<<<< HEAD
router.post('/', protect, authorize('superadmin', 'superadmin_staff', 'super_admin'), upload.single('image'), (req, res) => {
=======
router.post('/', protect, upload.single('image'), (req, res) => {
>>>>>>> 6dfc12997f3e2414b641995ff74b7061e283e305
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const fileUrl = req.file.path || req.file.secure_url;

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            imageUrl: fileUrl
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during upload' });
    }
});

// POST /api/v1/upload/multiple
router.post('/multiple', protect, upload.array('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Please upload at least one file' });
        }

        const urls = req.files.map(file => file.path || file.secure_url);

        res.status(200).json({
            success: true,
            message: 'Files uploaded successfully',
            urls
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during upload' });
    }
});

module.exports = router;
