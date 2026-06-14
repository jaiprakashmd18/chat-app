const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  friendedAt: { type: Date, default: Date.now },
}, { timestamps: true });

friendSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Friend', friendSchema);
