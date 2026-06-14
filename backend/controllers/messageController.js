const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { paginate } = require('../utils/helpers');

exports.getMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, participants: req.user.id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const { page = 1, limit = 50, before } = req.query;
    const query = {
      chat: chat._id,
      isDeleted: false,
      deletedFor: { $nin: [req.user.id] },
    };
    if (before) query.createdAt = { $lt: new Date(before) };

    const { skip } = paginate(null, page, limit);
    const messages = await Message.find(query)
      .populate('sender', 'username displayName avatar')
      .populate('replyTo', 'content sender type file')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);
    res.status(200).json({ success: true, messages: messages.reverse(), total, page: parseInt(page), hasMore: skip + messages.length < total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, participants: req.user.id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const { content, type = 'text', replyTo } = req.body;
    let fileData = null;

    if (req.file) {
      fileData = {
        url: req.file.path,
        publicId: req.file.filename,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      };
    }

    const message = await Message.create({
      chat: chat._id,
      sender: req.user.id,
      content: content || '',
      type: req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype.startsWith('audio/') ? 'audio' : 'document') : type,
      file: fileData,
      replyTo: replyTo || null,
      deliveredTo: [req.user.id],
      readBy: [req.user.id],
    });

    await message.populate('sender', 'username displayName avatar');
    if (replyTo) await message.populate('replyTo', 'content sender type file');

    chat.lastMessage = message._id;
    chat.lastActivity = new Date();

    chat.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        const unread = chat.unreadCounts.find(u => u.user.toString() === participantId.toString());
        if (unread) unread.count += 1;
        else chat.unreadCounts.push({ user: participantId, count: 1 });
      }
    });

    await chat.save();
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const message = await Message.findOne({ _id: req.params.messageId, sender: req.user.id });
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.type !== 'text') return res.status(400).json({ success: false, message: 'Only text messages can be edited' });

    message.content = req.body.content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    const isSender = message.sender.toString() === req.user.id;
    const { deleteFor = 'me' } = req.body;

    if (deleteFor === 'everyone' && isSender) {
      message.isDeleted = true;
      message.content = 'This message was deleted';
    } else {
      message.deletedFor.addToSet(req.user.id);
    }

    await message.save();
    res.status(200).json({ success: true, messageId: message._id, deletedFor: deleteFor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      const userIdx = existingReaction.users.indexOf(req.user.id);
      if (userIdx > -1) {
        existingReaction.users.splice(userIdx, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(req.user.id);
      }
    } else {
      message.reactions.push({ emoji, users: [req.user.id] });
    }

    await message.save();
    res.status(200).json({ success: true, reactions: message.reactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.pinMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    const chat = await Chat.findById(message.chat);
    message.isPinned = !message.isPinned;
    await message.save();

    if (message.isPinned) {
      chat.pinnedMessages.addToSet(message._id);
    } else {
      chat.pinnedMessages.pull(message._id);
    }
    await chat.save();

    res.status(200).json({ success: true, isPinned: message.isPinned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.starMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    const isStarred = message.isStarred.includes(req.user.id);
    if (isStarred) {
      message.isStarred.pull(req.user.id);
    } else {
      message.isStarred.addToSet(req.user.id);
    }
    await message.save();

    res.status(200).json({ success: true, starred: !isStarred });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStarredMessages = async (req, res) => {
  try {
    const messages = await Message.find({ isStarred: req.user.id, isDeleted: false })
      .populate('sender', 'username displayName avatar')
      .populate('chat', 'type participants group')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchMessages = async (req, res) => {
  try {
    const { q, chatId } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    const query = {
      $text: { $search: q },
      isDeleted: false,
      deletedFor: { $nin: [req.user.id] },
    };
    if (chatId) query.chat = chatId;

    const messages = await Message.find(query)
      .populate('sender', 'username displayName avatar')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
