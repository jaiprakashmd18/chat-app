const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const query = { recipient: req.user.id };
    if (unreadOnly === 'true') query.isRead = false;

    const notifications = await Notification.find(query)
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const query = { recipient: req.user.id };
    if (notificationIds?.length) query._id = { $in: notificationIds };

    await Notification.updateMany(query, { isRead: true, readAt: new Date() });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
