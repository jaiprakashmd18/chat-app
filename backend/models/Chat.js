const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group', 'channel'],
    required: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastActivity: { type: Date, default: Date.now },
  unreadCounts: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    count: { type: Number, default: 0 },
  }],
  mutedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('Chat', chatSchema);
