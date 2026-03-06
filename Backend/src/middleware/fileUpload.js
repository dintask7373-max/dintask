const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let resource_type = 'image';
        if (file.mimetype.startsWith('video')) {
            resource_type = 'video';
        }
        return {
            folder: 'dintask-uploads',
            resource_type: resource_type,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'webm', 'mov', 'avi']
        };
    },
});

const fileFilter = (req, file, cb) => {
    // Accept images and videos
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi)$/)) {
        return cb(new Error('Only image and video files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for videos
});

module.exports = upload;
