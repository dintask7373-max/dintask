const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
    ticketId: {
        type: String, // e.g., #TKT-1001
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    type: {
        type: String,
        enum: ['Technical', 'Subscription', 'Billing', 'Feature Request', 'Other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'Pending', 'Escalated', 'Resolved', 'Closed'],
        default: 'Pending'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'creatorModel'
    },
    creatorModel: {
        type: String,
        required: true,
        enum: ['Employee', 'Manager', 'SalesExecutive', 'Admin'] // Who created it
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true // Links ticket to a specific company/admin
    },
    isEscalatedToSuperAdmin: {
        type: Boolean,
        default: false
    },
    attachments: [{
        type: String // URLs to images/files
    }],
    responses: [{
        responder: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'responses.responderModel'
        },
        responderModel: {
            type: String,
            enum: ['Admin', 'SuperAdmin', 'Employee', 'Manager']
        },
        message: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: String,
    resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
