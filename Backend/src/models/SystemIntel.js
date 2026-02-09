const mongoose = require('mongoose');

const SystemIntelSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        unique: true,
        enum: ['Admin', 'Manager', 'Sales', 'Employee', 'SuperAdmin']
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    process: {
        type: String,
        required: [true, 'Please add a process description']
    },
    flow: {
        type: [String],
        required: [true, 'Please add at least one flow step']
    },
    features: {
        type: [String],
        required: [true, 'Please add at least one feature']
    },
    icon: {
        type: String,
        default: ''
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemIntel', SystemIntelSchema);
