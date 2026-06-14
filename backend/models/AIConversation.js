const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const aiConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Conversation' },
  messages: [aiMessageSchema],
  model: { type: String, default: 'gpt-3.5-turbo' },
  totalTokens: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

aiConversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);
