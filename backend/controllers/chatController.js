const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id, isActive: true })
      .populate('participants', 'username displayName avatar status lastSeen')
      .populate('lastMessage')
      .populate('group', 'name avatar members')
      .sort({ lastActivity: -1 });

    const filteredChats = chats.filter(c => !c.archivedBy.includes(req.user.id));
    res.status(200).json({ success: true, chats: filteredChats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrCreateDirectChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.user.blockedUsers.includes(userId) || targetUser.blockedUsers.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Cannot start chat with this user' });
    }

    let chat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [req.user.id, userId], $size: 2 },
    }).populate('participants', 'username displayName avatar status lastSeen statusMessage');

    if (!chat) {
      chat = await Chat.create({
        type: 'direct',
        participants: [req.user.id, userId],
      });
      chat = await chat.populate('participants', 'username displayName avatar status lastSeen statusMessage');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, participants: req.user.id })
      .populate('participants', 'username displayName avatar status lastSeen statusMessage')
      .populate('lastMessage')
      .populate('group');

    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.muteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, participants: req.user.id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const isMuted = chat.mutedBy.includes(req.user.id);
    if (isMuted) {
      chat.mutedBy.pull(req.user.id);
    } else {
      chat.mutedBy.push(req.user.id);
    }
    await chat.save();
    res.status(200).json({ success: true, muted: !isMuted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.archiveChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, participants: req.user.id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const isArchived = chat.archivedBy.includes(req.user.id);
    if (isArchived) {
      chat.archivedBy.pull(req.user.id);
    } else {
      chat.archivedBy.push(req.user.id);
    }
    await chat.save();
    res.status(200).json({ success: true, archived: !isArchived });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, participants: req.user.id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    await Message.updateMany(
      { chat: chat._id, readBy: { $nin: [req.user.id] } },
      { $addToSet: { readBy: req.user.id } }
    );

    const unreadEntry = chat.unreadCounts.find(u => u.user.toString() === req.user.id);
    if (unreadEntry) {
      unreadEntry.count = 0;
      await chat.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPinnedMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, participants: req.user.id })
      .populate({ path: 'pinnedMessages', populate: { path: 'sender', select: 'username displayName avatar' } });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.status(200).json({ success: true, pinnedMessages: chat.pinnedMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
