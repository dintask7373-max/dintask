const express = require('express');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications,
    updateFcmToken
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getNotifications);

router.route('/fcm-token')
    .put(updateFcmToken);

router.route('/read-all')
    .put(markAllAsRead);

router.route('/bulk-delete')
    .post(bulkDeleteNotifications);

router.route('/:id')
    .delete(deleteNotification);

router.route('/:id/read')
    .put(markAsRead);

module.exports = router;
