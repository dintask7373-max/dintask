const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Admin', 'Manager', 'Employee', 'SalesExecutive', 'SuperAdmin']
    },
    text: {
        type: String,
        required: true
    },
    attachments: [{
        type: String // URLs to files/images
    }],
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'readBy.onModel'
        },
        onModel: {
            type: String,
            enum: ['Admin', 'Manager', 'Employee', 'SalesExecutive', 'SuperAdmin']
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);
