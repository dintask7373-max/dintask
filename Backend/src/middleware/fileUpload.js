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
        return {
            folder: 'dintask-uploads',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'webm', 'mov', 'avi', 'pdf']
        };
    },
});

const fileFilter = (req, file, cb) => {
    // Accept images, videos, and PDFs
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi|pdf)$/)) {
        return cb(new Error('Only image, video, and PDF files are allowed!'), false);
    }
    cb(null, true);
};


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for videos
});

module.exports = upload;
