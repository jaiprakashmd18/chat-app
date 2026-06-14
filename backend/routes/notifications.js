const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification, clearAll } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead);
router.delete('/all', protect, clearAll);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
