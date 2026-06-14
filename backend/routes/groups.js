const express = require('express');
const router = express.Router();
const { createGroup, getGroup, updateGroup, addMember, removeMember, leaveGroup, updateMemberRole, getInviteLink, joinByInvite } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/', protect, createGroup);
router.get('/join/:code', protect, joinByInvite);
router.get('/:id', protect, getGroup);
router.put('/:id', protect, updateGroup);
router.put('/:id/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    const Group = require('../models/Group');
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const member = group.members.find(m => m.user.toString() === req.user.id);
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    group.avatar = { url: req.file.path, publicId: req.file.filename };
    await group.save();
    res.status(200).json({ success: true, avatar: group.avatar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);
router.put('/:id/members/role', protect, updateMemberRole);
router.post('/:id/leave', protect, leaveGroup);
router.get('/:id/invite', protect, getInviteLink);

module.exports = router;
