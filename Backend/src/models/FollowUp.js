const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: [true, 'Please add a lead ID']
    },
    salesRepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesExecutive', // or 'User' depending on how you've structured it, but crmStore uses 'SalesExecutive'
        required: [true, 'Please add a sales rep ID']
    },
    type: {
        type: String,
        enum: ['Call', 'Meeting', 'Email', 'WhatsApp'],
        default: 'Call'
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Please add a schedule date']
    },
    notes: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Missed', 'Cancelled'],
        default: 'Scheduled'
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', FollowUpSchema);
