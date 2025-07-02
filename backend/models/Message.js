const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  read: {
    type: Boolean,
    default: false
  },
  conversationId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create conversation ID helper method
messageSchema.statics.createConversationId = function(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
};

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
