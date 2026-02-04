const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllRead
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllRead);

module.exports = router;
