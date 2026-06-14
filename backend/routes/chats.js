const express = require('express');
const router = express.Router();
const { getChats, getOrCreateDirectChat, getChatById, muteChat, archiveChat, markAsRead, getPinnedMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getChats);
router.get('/:id', protect, getChatById);
router.get('/:id/pinned', protect, getPinnedMessages);
router.post('/direct/:userId', protect, getOrCreateDirectChat);
router.put('/:id/mute', protect, muteChat);
router.put('/:id/archive', protect, archiveChat);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
