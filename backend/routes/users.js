const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateAvatar, deleteAvatar, updateStatus, searchUsers, blockUser, unblockUser, getBlockedUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/search', protect, searchUsers);
router.get('/blocked', protect, getBlockedUsers);
router.get('/:id', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.delete('/avatar', protect, deleteAvatar);
router.put('/status', protect, updateStatus);
router.post('/block/:userId', protect, blockUser);
router.delete('/block/:userId', protect, unblockUser);

module.exports = router;
