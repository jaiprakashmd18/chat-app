const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: {
    type: String,
    enum: ['user', 'message', 'group', 'community'],
    required: true,
  },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  targetGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  targetCommunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'hate_speech', 'inappropriate', 'fraud', 'other'],
    required: true,
  },
  description: { type: String, maxlength: 1000, default: '' },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending',
  },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: { type: String, default: '' },
  resolvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
