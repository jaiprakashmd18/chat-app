const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { _id: false });

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'voice', 'document', 'gif', 'sticker', 'system'],
    default: 'text',
  },
  file: {
    url: String,
    publicId: String,
    name: String,
    size: Number,
    mimeType: String,
    thumbnail: String,
    duration: Number,
  },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  reactions: [reactionSchema],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPinned: { type: Boolean, default: false },
  isStarred: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  systemType: {
    type: String,
    enum: ['user_joined', 'user_left', 'group_created', 'name_changed', 'avatar_changed', 'member_added', 'member_removed'],
  },
}, { timestamps: true });

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ content: 'text' });

module.exports = mongoose.model('Message', messageSchema);
