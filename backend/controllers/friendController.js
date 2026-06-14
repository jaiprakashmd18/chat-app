const Friend = require('../models/Friend');
const FriendRequest = require('../models/FriendRequest');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getFriends = async (req, res) => {
  try {
    const friends = await Friend.find({ $or: [{ user1: req.user.id }, { user2: req.user.id }] })
      .populate('user1', 'username displayName avatar status statusMessage lastSeen')
      .populate('user2', 'username displayName avatar status statusMessage lastSeen')
      .populate('chat');

    const formatted = friends.map(f => ({
      friendship: f._id,
      friend: f.user1._id.toString() === req.user.id ? f.user2 : f.user1,
      chat: f.chat,
      friendedAt: f.friendedAt,
    }));

    res.status(200).json({ success: true, friends: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
    if (!targetUser.privacy.allowFriendRequests) {
      return res.status(403).json({ success: false, message: 'This user is not accepting friend requests' });
    }

    const existingFriendship = await Friend.findOne({
      $or: [{ user1: req.user.id, user2: userId }, { user1: userId, user2: req.user.id }],
    });
    if (existingFriendship) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: req.user.id, to: userId, status: 'pending' },
        { from: userId, to: req.user.id, status: 'pending' },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Friend request already exists' });
    }

    const request = await FriendRequest.create({ from: req.user.id, to: userId, message: req.body.message });
    await request.populate('from', 'username displayName avatar');

    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      type: 'friend_request',
      title: 'New Friend Request',
      body: `${req.user.displayName} sent you a friend request`,
      data: { requestId: request._id },
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    const request = await FriendRequest.findOne({ _id: requestId, to: req.user.id, status: 'pending' });
    if (!request) return res.status(404).json({ success: false, message: 'Friend request not found' });

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    await request.save();

    if (action === 'accept') {
      const chat = await Chat.create({
        type: 'direct',
        participants: [request.from, request.to],
      });

      await Friend.create({ user1: request.from, user2: request.to, chat: chat._id });

      await Notification.create({
        recipient: request.from,
        sender: req.user.id,
        type: 'friend_accept',
        title: 'Friend Request Accepted',
        body: `${req.user.displayName} accepted your friend request`,
        data: { userId: req.user.id },
      });
    }

    res.status(200).json({ success: true, status: request.status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    await Friend.findOneAndDelete({
      $or: [{ user1: req.user.id, user2: userId }, { user1: userId, user2: req.user.id }],
    });
    res.status(200).json({ success: true, message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ to: req.user.id, status: 'pending' })
      .populate('from', 'username displayName avatar bio')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ from: req.user.id, status: 'pending' })
      .populate('to', 'username displayName avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    await FriendRequest.findOneAndDelete({ from: req.user.id, to: req.params.userId, status: 'pending' });
    res.status(200).json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
