const express = require('express');
const router = express.Router();
const { getConversations, getConversation, sendMessage, deleteConversation, smartReply } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversation);
router.post('/chat', protect, sendMessage);
router.delete('/conversations/:id', protect, deleteConversation);
router.post('/smart-reply', protect, smartReply);

module.exports = router;
