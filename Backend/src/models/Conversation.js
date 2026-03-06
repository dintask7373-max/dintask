const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'participants.onModel'
        },
        onModel: {
            type: String,
            required: true,
            enum: ['Admin', 'Manager', 'Employee', 'SalesExecutive', 'SuperAdmin']
        }
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        trim: true
    },
    groupAvatar: {
        type: String
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    workspaceId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);
