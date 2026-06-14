const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 500, default: '' },
  type: {
    type: String,
    enum: ['text', 'voice', 'announcement', 'stage'],
    default: 'text',
  },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  position: { type: Number, default: 0 },
  isNSFW: { type: Boolean, default: false },
  slowMode: { type: Number, default: 0 },
  permissions: {
    readMessages: { roles: [String], default: ['everyone'] },
    sendMessages: { roles: [String], default: ['member', 'moderator', 'admin', 'owner'] },
    manageMessages: { roles: [String], default: ['moderator', 'admin', 'owner'] },
  },
  topic: { type: String, maxlength: 300, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
