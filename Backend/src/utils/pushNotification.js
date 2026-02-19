const admin = require('../config/firebase');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const SalesExecutive = require('../models/SalesExecutive');

/**
 * Send a push notification to specific FCM tokens
 * @param {string|string[]} tokens - FCM token or array of tokens
 * @param {object} payload - Notification payload { title, body, data }
 */
const sendPushNotification = async (tokens, payload) => {
    if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
        return;
    }

    const { title, body, data } = payload;

    const message = {
        notification: {
            title,
            body
        },
        data: data || {},
    };

    try {
        if (Array.isArray(tokens)) {
            // Filter out empty tokens
            const validTokens = tokens.filter(t => t && t.trim() !== '');
            if (validTokens.length === 0) return;

            const response = await admin.messaging().sendEachForMulticast({
                tokens: validTokens,
                ...message
            });
            console.log(`Successfully sent ${response.successCount} notifications`);
            return response;
        } else {
            if (!tokens || tokens.trim() === '') return;

            const response = await admin.messaging().send({
                token: tokens,
                ...message
            });
            console.log('Successfully sent notification:', response);
            return response;
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
        return { error };
    }
};

/**
 * Send push notification to a user by their ID (searches all user models)
 * @param {string} userId - ID of the recipient
 * @param {object} payload - { title, body, data }
 */
const sendPushToUser = async (userId, payload) => {
    try {
        const models = [Admin, SuperAdmin, Employee, Manager, SalesExecutive];
        let user = null;

        for (const Model of models) {
            const found = await Model.findById(userId).select('+fcmToken');
            if (found) {
                user = found;
                // Only break early if user has token(s)
                const hasToken = (found.fcmToken?.app && found.fcmToken.app.trim() !== '') ||
                    (found.fcmToken?.web && found.fcmToken.web.trim() !== '');
                if (hasToken) break;
            }
        }

        if (!user) return;

        const tokens = [];
        if (user.fcmToken?.app && user.fcmToken.app.trim() !== '') tokens.push(user.fcmToken.app.trim());
        if (user.fcmToken?.web && user.fcmToken.web.trim() !== '') tokens.push(user.fcmToken.web.trim());

        if (tokens.length > 0) {
            return await sendPushNotification(tokens, payload);
        } else {
            console.log(`[Push] No FCM token found for user ${userId} — skipping push.`);
        }
    } catch (error) {
        console.error('Error in sendPushToUser:', error);
    }
};

module.exports = {
    sendPushNotification,
    sendPushToUser
};
