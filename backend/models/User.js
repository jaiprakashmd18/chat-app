const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  avatar: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  bio: { type: String, maxlength: [200, 'Bio cannot exceed 200 characters'], default: '' },
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline'],
    default: 'offline',
  },
  statusMessage: { type: String, maxlength: [100], default: '' },
  lastSeen: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
  accentColor: { type: String, default: '#7c3aed' },
  language: { type: String, default: 'en' },
  notifications: {
    messages: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    friendRequests: { type: Boolean, default: true },
    groupInvites: { type: Boolean, default: true },
    sound: { type: Boolean, default: true },
    desktop: { type: Boolean, default: true },
  },
  privacy: {
    showLastSeen: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['everyone', 'friends', 'nobody'], default: 'everyone' },
  },
  verificationToken: String,
  verificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activeTokens: [String],
  socketId: { type: String, default: '' },
  devices: [{
    deviceId: String,
    deviceName: String,
    lastActive: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.activeTokens;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
