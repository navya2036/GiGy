const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  conversationId: {
    type: String,
    unique: true,
    required: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
