const express = require('express');
<<<<<<< HEAD
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, bulkDeleteNotifications } = require('../controllers/notificationController');
=======
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications,
    updateFcmToken
} = require('../controllers/notificationController');
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getNotifications);

<<<<<<< HEAD
=======
router.route('/fcm-token')
    .put(updateFcmToken);

>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
router.route('/read-all')
    .put(markAllAsRead);

router.route('/bulk-delete')
    .post(bulkDeleteNotifications);

router.route('/:id')
    .delete(deleteNotification);

router.route('/:id/read')
    .put(markAsRead);

module.exports = router;
