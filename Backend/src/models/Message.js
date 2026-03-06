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

// Post-save hook for push notifications
MessageSchema.post('save', async function (doc) {
    try {
        const Conversation = mongoose.model('Conversation');
        const conv = await Conversation.findById(doc.conversationId).populate('participants.user', 'name');

        if (!conv) return;

        const { sendPushToUser } = require('../utils/pushNotification');
        const senderName = doc.senderModel === 'Admin' ? 'Admin' : 'Someone'; // We could populate sender too

        for (const p of conv.participants) {
            // Don't send push to the sender
            if (p.user._id.toString() === doc.senderId.toString()) continue;

            await sendPushToUser(p.user._id, {
                title: conv.isGroup ? `New in ${conv.groupName}` : 'New Message',
                body: doc.text.substring(0, 100),
                data: {
                    type: 'chat',
                    conversationId: doc.conversationId.toString(),
                    link: '/chat'
                }
            });
        }
    } catch (err) {
        console.error('Chat Push Error:', err);
    }
});

module.exports = mongoose.model('Message', MessageSchema);
