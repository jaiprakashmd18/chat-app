const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

const onlineUsers = new Map();
const typingUsers = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { status: 'online', socketId: socket.id, lastSeen: new Date() });
    io.emit('user:status', { userId, status: 'online' });

    const userChats = await Chat.find({ participants: userId });
    userChats.forEach(chat => socket.join(`chat:${chat._id}`));

    console.log(`Socket connected: ${socket.user.username} (${socket.id})`);

    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, type = 'text', replyTo, tempId } = data;
        const chat = await Chat.findOne({ _id: chatId, participants: userId });
        if (!chat) return;

        const message = await Message.create({
          chat: chatId,
          sender: userId,
          content: content || '',
          type,
          replyTo: replyTo || null,
          readBy: [userId],
          deliveredTo: [userId],
        });

        await message.populate('sender', 'username displayName avatar');
        if (replyTo) await message.populate('replyTo', 'content sender type file');

        chat.lastMessage = message._id;
        chat.lastActivity = new Date();
        chat.participants.forEach(p => {
          if (p.toString() !== userId) {
            const entry = chat.unreadCounts.find(u => u.user.toString() === p.toString());
            if (entry) entry.count += 1;
            else chat.unreadCounts.push({ user: p, count: 1 });
          }
        });
        await chat.save();

        io.to(`chat:${chatId}`).emit('message:new', { ...message.toObject(), tempId });

        chat.participants.forEach(async (participantId) => {
          const pId = participantId.toString();
          if (pId !== userId) {
            const participantSocket = onlineUsers.get(pId);
            if (participantSocket) {
              io.to(participantSocket).emit('message:delivered', { messageId: message._id, chatId });
              await Message.findByIdAndUpdate(message._id, { $addToSet: { deliveredTo: pId } });
            }

            await Notification.create({
              recipient: pId,
              sender: userId,
              type: 'message',
              title: socket.user.displayName,
              body: type === 'text' ? content?.slice(0, 50) : `Sent a ${type}`,
              data: { chatId, messageId: message._id },
            });
          }
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('message:read', async ({ chatId, messageIds }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds }, chat: chatId, readBy: { $nin: [userId] } },
          { $addToSet: { readBy: userId } }
        );
        await Chat.findOneAndUpdate(
          { _id: chatId, 'unreadCounts.user': userId },
          { $set: { 'unreadCounts.$.count': 0 } }
        );
        socket.to(`chat:${chatId}`).emit('message:read_receipt', { chatId, messageIds, readBy: userId });
      } catch (error) {
        console.error('Read error:', error);
      }
    });

    socket.on('typing:start', ({ chatId }) => {
      const key = `${chatId}:${userId}`;
      typingUsers.set(key, Date.now());
      socket.to(`chat:${chatId}`).emit('typing:update', {
        chatId,
        userId,
        displayName: socket.user.displayName,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      const key = `${chatId}:${userId}`;
      typingUsers.delete(key);
      socket.to(`chat:${chatId}`).emit('typing:update', {
        chatId,
        userId,
        isTyping: false,
      });
    });

    socket.on('message:edit', async ({ messageId, content }) => {
      try {
        const message = await Message.findOne({ _id: messageId, sender: userId });
        if (!message) return;
        message.content = content;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();
        io.to(`chat:${message.chat}`).emit('message:edited', { messageId, content, editedAt: message.editedAt });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('message:delete', async ({ messageId, deleteFor }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        if (deleteFor === 'everyone' && message.sender.toString() === userId) {
          message.isDeleted = true;
          message.content = 'This message was deleted';
          await message.save();
          io.to(`chat:${message.chat}`).emit('message:deleted', { messageId, deletedFor: 'everyone' });
        } else {
          message.deletedFor.addToSet(userId);
          await message.save();
          socket.emit('message:deleted', { messageId, deletedFor: 'me' });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('reaction:add', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        const existing = message.reactions.find(r => r.emoji === emoji);
        if (existing) {
          const idx = existing.users.indexOf(userId);
          if (idx > -1) existing.users.splice(idx, 1);
          else existing.users.push(userId);
          if (existing.users.length === 0) message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        } else {
          message.reactions.push({ emoji, users: [userId] });
        }
        await message.save();
        io.to(`chat:${message.chat}`).emit('reaction:updated', { messageId, reactions: message.reactions });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('status:update', async ({ status }) => {
      const validStatuses = ['online', 'away', 'busy', 'offline'];
      if (!validStatuses.includes(status)) return;
      await User.findByIdAndUpdate(userId, { status });
      io.emit('user:status', { userId, status });
    });

    socket.on('call:initiate', ({ targetUserId, callType, chatId }) => {
      const targetSocket = onlineUsers.get(targetUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('call:incoming', {
          callerId: userId,
          callerName: socket.user.displayName,
          callerAvatar: socket.user.avatar,
          callType,
          chatId,
        });
      }
    });

    socket.on('call:accept', ({ callerId, chatId }) => {
      const callerSocket = onlineUsers.get(callerId);
      if (callerSocket) io.to(callerSocket).emit('call:accepted', { userId, chatId });
    });

    socket.on('call:reject', ({ callerId }) => {
      const callerSocket = onlineUsers.get(callerId);
      if (callerSocket) io.to(callerSocket).emit('call:rejected', { userId });
    });

    socket.on('call:end', ({ targetUserId }) => {
      const targetSocket = onlineUsers.get(targetUserId);
      if (targetSocket) io.to(targetSocket).emit('call:ended', { userId });
    });

    socket.on('webrtc:offer', ({ targetUserId, offer }) => {
      const targetSocket = onlineUsers.get(targetUserId);
      if (targetSocket) io.to(targetSocket).emit('webrtc:offer', { from: userId, offer });
    });

    socket.on('webrtc:answer', ({ targetUserId, answer }) => {
      const targetSocket = onlineUsers.get(targetUserId);
      if (targetSocket) io.to(targetSocket).emit('webrtc:answer', { from: userId, answer });
    });

    socket.on('webrtc:ice-candidate', ({ targetUserId, candidate }) => {
      const targetSocket = onlineUsers.get(targetUserId);
      if (targetSocket) io.to(targetSocket).emit('webrtc:ice-candidate', { from: userId, candidate });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { status: 'offline', socketId: '', lastSeen: new Date() });
      io.emit('user:status', { userId, status: 'offline', lastSeen: new Date() });
      console.log(`Socket disconnected: ${socket.user.username}`);
    });
  });

  setInterval(() => {
    const now = Date.now();
    typingUsers.forEach((timestamp, key) => {
      if (now - timestamp > 5000) {
        const [chatId, userId] = key.split(':');
        typingUsers.delete(key);
        io.to(`chat:${chatId}`).emit('typing:update', { chatId, userId, isTyping: false });
      }
    });
  }, 5000);

  return { onlineUsers };
};

module.exports = { initializeSocket };
