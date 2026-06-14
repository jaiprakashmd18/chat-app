const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, editMessage, deleteMessage, addReaction, pinMessage, starMessage, getStarredMessages, searchMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { messageLimiter } = require('../middleware/rateLimit');

router.get('/starred', protect, getStarredMessages);
router.get('/search', protect, searchMessages);
router.get('/:chatId', protect, getMessages);
router.post('/:chatId', protect, messageLimiter, upload.single('file'), sendMessage);
router.put('/:messageId/edit', protect, editMessage);
router.delete('/:messageId', protect, deleteMessage);
router.post('/:messageId/react', protect, addReaction);
router.put('/:messageId/pin', protect, pinMessage);
router.put('/:messageId/star', protect, starMessage);

module.exports = router;
