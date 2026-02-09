const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');
const { protect, authorize } = require('../middleware/auth');

// POST /api/v1/upload
router.post('/', protect, authorize('superadmin', 'superadmin_staff'), upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        // Construct file URL
        const fileUrl = req.file.path || req.file.secure_url;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: fileUrl // This URL is now accessible publicly
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during upload' });
    }
});

module.exports = router;
