const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Generic reference
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'lead_assigned',
            'project_approved',
            'task_assigned',
            'support_ticket',
            'general',
            'payment',
            'inquiry',
            'project_assigned',
            'team_registration',
            'deal_won',
            'conversion_request',
            'subscription_alert',
            'task_overdue',
            'security_alert',
            'support_update'
        ],
        default: 'general'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Helper to send real-time socket notification
const emitSocketNotification = (doc) => {
    if (global.io) {
        global.io.to(doc.recipient.toString()).emit('new_notification', doc);
    }
};

// Post-save hook to send push notification and socket update
NotificationSchema.post('save', async function (doc) {
    try {
        const { sendPushToUser } = require('../utils/pushNotification');

        // Send Socket.io notification
        emitSocketNotification(doc);

        await sendPushToUser(doc.recipient, {
            title: doc.title,
            body: doc.message,
            data: {
                link: doc.link || '',
                type: doc.type || 'general',
                notificationId: doc._id.toString()
            }
        });
    } catch (err) {
        console.error('[Notification Hook ERROR] Error in post-save:', err);
    }
});

// Post-insertMany hook to send push notifications and socket updates
NotificationSchema.post('insertMany', async function (docs) {
    try {
        const { sendPushToUser } = require('../utils/pushNotification');
        for (const doc of docs) {
            // Send Socket.io notification
            emitSocketNotification(doc);

            await sendPushToUser(doc.recipient, {
                title: doc.title,
                body: doc.message,
                data: {
                    link: doc.link || '',
                    type: doc.type || 'general',
                    notificationId: doc._id.toString()
                }
            });
        }
    } catch (err) {
        console.error('[Notification Hook ERROR] Error in post-insertMany:', err);
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
