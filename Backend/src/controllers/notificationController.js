const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await notification.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Bulk delete notifications
// @route   POST /api/v1/notifications/bulk-delete
// @access  Private
exports.bulkDeleteNotifications = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, error: 'Please provide an array of IDs' });
        }

        await Notification.deleteMany({
            _id: { $in: ids },
            recipient: req.user.id
        });

        res.status(200).json({ success: true, message: 'Notifications deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
