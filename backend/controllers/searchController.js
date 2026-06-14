const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const Community = require('../models/Community');

exports.globalSearch = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query too short' });
    }

    const results = {};
    const skip = (page - 1) * limit;

    if (!type || type === 'users') {
      results.users = await User.find({
        $and: [
          { _id: { $ne: req.user.id, $nin: req.user.blockedUsers } },
          { $or: [{ username: { $regex: q, $options: 'i' } }, { displayName: { $regex: q, $options: 'i' } }] },
          { 'privacy.profileVisibility': { $ne: 'nobody' } },
        ],
      }).select('username displayName avatar status bio').limit(parseInt(limit)).skip(skip);
    }

    if (!type || type === 'groups') {
      results.groups = await Group.find({
        isPublic: true,
        isActive: true,
        $or: [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }],
      }).select('name description avatar members').limit(parseInt(limit)).skip(skip);
    }

    if (!type || type === 'communities') {
      results.communities = await Community.find({
        isPublic: true,
        isActive: true,
        $or: [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }],
      }).select('name description avatar memberCount').limit(parseInt(limit)).skip(skip);
    }

    if (!type || type === 'messages') {
      results.messages = await Message.find({
        $text: { $search: q },
        isDeleted: false,
        deletedFor: { $nin: [req.user.id] },
      })
        .populate('sender', 'username displayName avatar')
        .populate('chat', 'type participants group')
        .sort({ score: { $meta: 'textScore' } })
        .limit(parseInt(limit))
        .skip(skip);
    }

    res.status(200).json({ success: true, results, query: q });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
