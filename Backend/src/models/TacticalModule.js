const mongoose = require('mongoose');

const TacticalModuleSchema = new mongoose.Schema({
    moduleId: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'manager', 'employee', 'sales'] // Restrict to the 4 core types
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true,
        default: 'Layout' // Default lucide icon name
    },
    image: {
        type: String, // Cloudinary URL or similar
        required: true
    },
    themeColor: {
        type: String,
        enum: ['blue', 'purple', 'amber', 'emerald', 'yellow', 'orange', 'red', 'green', 'indigo', 'pink'],
        default: 'blue'
    },
    targetAudience: {
        type: String,
        required: true
    },
    detailedFeatures: {
        type: [String], // Array of feature strings
        default: []
    },
    tags: {
        type: [String], // Array of tag strings
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('TacticalModule', TacticalModuleSchema);
