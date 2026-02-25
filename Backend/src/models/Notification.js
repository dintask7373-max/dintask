const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
        ref: 'User', // Generic reference, but usually Employee or SalesExecutive
=======
        ref: 'User', // Generic reference
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
<<<<<<< HEAD
        enum: ['lead_assigned', 'project_approved', 'task_assigned', 'support_ticket', 'general'],
=======
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
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
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
<<<<<<< HEAD
        type: String // Optional link to the resource (e.g., /crm/leads/123)
=======
        type: String
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
    },
    isRead: {
        type: Boolean,
        default: false
    },
<<<<<<< HEAD
=======
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
    createdAt: {
        type: Date,
        default: Date.now
    }
});

<<<<<<< HEAD
=======
// Helper to send real-time socket notification
const emitSocketNotification = (doc) => {
    if (global.io) {
        global.io.to(doc.recipient.toString()).emit('new_notification', doc);
    }
};

// Post-save hook to send push notification and socket update
NotificationSchema.post('save', async function (doc) {
    const { sendPushToUser } = require('../utils/pushNotification');

    // Send Socket.io notification
    emitSocketNotification(doc);

    try {
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
        console.error('Error sending push notification from hook:', err);
    }
});

// Post-insertMany hook to send push notifications and socket updates
NotificationSchema.post('insertMany', async function (docs) {
    const { sendPushToUser } = require('../utils/pushNotification');
    try {
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
        console.error('Error sending batch push notifications from hook:', err);
    }
});

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
module.exports = mongoose.model('Notification', NotificationSchema);
