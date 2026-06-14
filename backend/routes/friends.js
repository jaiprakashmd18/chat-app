const express = require('express');
const router = express.Router();
const { getFriends, sendFriendRequest, respondToRequest, removeFriend, getPendingRequests, getSentRequests, cancelRequest } = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFriends);
router.get('/requests/pending', protect, getPendingRequests);
router.get('/requests/sent', protect, getSentRequests);
router.post('/request/:userId', protect, sendFriendRequest);
router.put('/request/:requestId', protect, respondToRequest);
router.delete('/request/:userId/cancel', protect, cancelRequest);
router.delete('/:userId', protect, removeFriend);

module.exports = router;
