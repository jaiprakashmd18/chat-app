const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const Community = require('../models/Community');
const Report = require('../models/Report');
const Chat = require('../models/Chat');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, onlineUsers, totalMessages, totalGroups, totalCommunities, pendingReports] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'online' }),
      Message.countDocuments({ isDeleted: false }),
      Group.countDocuments({ isActive: true }),
      Community.countDocuments({ isActive: true }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const messagesThisWeek = await Message.countDocuments({ createdAt: { $gte: sevenDaysAgo }, isDeleted: false });

    const dailyActive = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await Message.countDocuments({ createdAt: { $gte: start, $lte: end } });
      dailyActive.push({ date: start.toISOString().split('T')[0], messages: count });
    }

    const userGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
      userGrowth.push({ date: start.toISOString().split('T')[0], users: count });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers, onlineUsers, totalMessages, totalGroups, totalCommunities, pendingReports,
        newUsersThisWeek, messagesThisWeek, dailyActive, userGrowth,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, banned } = req.query;
    const query = {};
    if (search) query.$or = [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { displayName: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;
    if (banned === 'true') query.isBanned = true;

    const users = await User.find(query)
      .select('-password -verificationToken -resetPasswordToken -activeTokens')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.status(200).json({ success: true, users, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, banned } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot ban yourself' });
    }

    await User.findByIdAndUpdate(userId, { isBanned: banned !== false, banReason: reason || '' });
    res.status(200).json({ success: true, message: banned !== false ? 'User banned' : 'User unbanned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isAdmin = !user.isAdmin;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'username displayName avatar')
      .populate('targetUser', 'username displayName')
      .populate('resolvedBy', 'username displayName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);
    res.status(200).json({ success: true, reports, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, resolution, resolvedBy: req.user.id, resolvedAt: new Date() },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };

    const groups = await Group.find(query)
      .populate('members.user', 'username displayName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Group.countDocuments(query);
    res.status(200).json({ success: true, groups, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
