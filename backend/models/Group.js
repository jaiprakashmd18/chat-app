const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'moderator', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  nickname: String,
  permissions: {
    sendMessages: { type: Boolean, default: true },
    sendMedia: { type: Boolean, default: true },
    addMembers: { type: Boolean, default: false },
    pinMessages: { type: Boolean, default: false },
    deleteMessages: { type: Boolean, default: false },
  },
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 500, default: '' },
  avatar: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  members: [memberSchema],
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  inviteCode: { type: String, unique: true },
  inviteExpiry: Date,
  maxMembers: { type: Number, default: 200 },
  isPublic: { type: Boolean, default: false },
  tags: [String],
  rules: { type: String, maxlength: 1000, default: '' },
  settings: {
    onlyAdminsCanMessage: { type: Boolean, default: false },
    onlyAdminsCanAddMembers: { type: Boolean, default: false },
    approvalRequired: { type: Boolean, default: false },
    slowMode: { type: Number, default: 0 },
  },
  bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

groupSchema.index({ name: 'text' });

module.exports = mongoose.model('Group', groupSchema);
