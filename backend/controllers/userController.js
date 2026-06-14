const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -verificationToken -resetPasswordToken -activeTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const publicProfile = user.toPublicJSON();
    if (req.user.id !== req.params.id) {
      if (!user.privacy.showLastSeen) delete publicProfile.lastSeen;
      if (!user.privacy.showOnlineStatus) delete publicProfile.status;
    }

    res.status(200).json({ success: true, user: publicProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['displayName', 'bio', 'statusMessage', 'theme', 'accentColor', 'language'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (req.body.notifications) updates.notifications = req.body.notifications;
    if (req.body.privacy) updates.privacy = req.body.privacy;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
    }

    user.avatar = { url: req.file.path, publicId: req.file.filename };
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
    }
    user.avatar = { url: '', publicId: '' };
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: 'Avatar removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, statusMessage } = req.body;
    const validStatuses = ['online', 'away', 'busy', 'offline'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (statusMessage !== undefined) updates.statusMessage = statusMessage;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.status(200).json({ success: true, status: user.status, statusMessage: user.statusMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query too short' });
    }

    const blockedUsers = req.user.blockedUsers || [];
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id, $nin: blockedUsers } },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { displayName: { $regex: q, $options: 'i' } },
          ],
        },
        { 'privacy.profileVisibility': { $ne: 'nobody' } },
      ],
    }).select('username displayName avatar status statusMessage bio').limit(20);

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot block yourself' });
    }
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: userId } });
    res.status(200).json({ success: true, message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: req.params.userId } });
    res.status(200).json({ success: true, message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('blockedUsers', 'username displayName avatar');
    res.status(200).json({ success: true, blockedUsers: user.blockedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
