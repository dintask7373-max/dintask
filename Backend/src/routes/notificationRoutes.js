const express = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getNotifications);

router.route('/:id/read')
    .put(markAsRead);

router.route('/read-all')
    .put(markAllAsRead);

module.exports = router;
