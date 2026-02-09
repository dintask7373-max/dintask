const mongoose = require('mongoose');

const SystemIntelSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        unique: true,
        enum: ['Admin', 'Manager', 'Sales', 'Employee']
    },
    title: {
        type: String,
        required: true
    },
    process: {
        type: String,
        required: true
    },
    flow: {
        type: [String],
        default: []
    },
    features: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('SystemIntel', SystemIntelSchema);
