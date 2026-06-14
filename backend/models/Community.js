const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: Number, default: 0 },
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
}, { _id: true });

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 1000, default: '' },
  avatar: { url: String, publicId: String },
  banner: { url: String, publicId: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'admin', 'moderator', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  categories: [categorySchema],
  inviteCode: { type: String, unique: true },
  isPublic: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  tags: [String],
  rules: { type: String, maxlength: 2000, default: '' },
  settings: {
    approvalRequired: { type: Boolean, default: false },
    minAccountAge: { type: Number, default: 0 },
  },
  bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  memberCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

communitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Community', communitySchema);
