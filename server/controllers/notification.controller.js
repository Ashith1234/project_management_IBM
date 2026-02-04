const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort('-createdAt')
        .limit(20);

    res.status(200).json({
        success: true,
        data: notifications
    });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user.id,
        isRead: false
    });

    res.status(200).json({
        success: true,
        data: count
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user.id, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});
