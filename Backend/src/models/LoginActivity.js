const mongoose = require('mongoose');

const LoginActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'roleModel' // Dynamic reference based on role
    },
    roleModel: {
        type: String,
        required: true,
        enum: ['Admin', 'Manager', 'SalesExecutive', 'Employee', 'SuperAdmin']
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'manager', 'sales', 'employee', 'super_admin']
    },
    loginAt: {
        type: Date,
        default: Date.now
    },
    logoutAt: {
        type: Date
    },
    sessionDuration: {
        type: Number // in minutes
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
});

// Indexes for faster aggregation
LoginActivitySchema.index({ role: 1 });
LoginActivitySchema.index({ loginAt: -1 });
LoginActivitySchema.index({ userId: 1 });

module.exports = mongoose.model('LoginActivity', LoginActivitySchema);
