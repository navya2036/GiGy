const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/chats/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    
    if (!recipientId || !message) {
      return res.status(400).json({ message: 'Recipient ID and message are required' });
    }
    
    // Check if recipient exists
    const recipientExists = await User.findById(recipientId);
    if (!recipientExists) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Create conversation ID (sorted to ensure consistency)
    const conversationId = Message.createConversationId(req.user._id.toString(), recipientId);
    
    // Create or update conversation
    let conversation = await Conversation.findOne({ conversationId });
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, recipientId],
        conversationId,
        lastMessage: message,
        lastMessageDate: Date.now()
      });
    } else {
      conversation.lastMessage = message;
      conversation.lastMessageDate = Date.now();
    }
    
    await conversation.save();
    
    // Create new message
    const newMessage = new Message({
      sender: req.user._id,
      recipient: recipientId,
      message,
      conversationId
    });
    
    const savedMessage = await newMessage.save();
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get messages between users
// @route   GET /api/chats/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversationId = Message.createConversationId(
      req.user._id.toString(),
      req.params.userId
    );
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId,
        recipient: req.user._id,
        read: false
      },
      { read: true }
    );
    
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/chats/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] }
    })
      .populate({
        path: 'participants',
        match: { _id: { $ne: req.user._id } },
        select: 'name email profilePicture'
      })
      .sort({ lastMessageDate: -1 });
    
    // Count unread messages for each conversation
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conversation.conversationId,
          recipient: req.user._id,
          read: false
        });
        
        return {
          ...conversation.toObject(),
          unreadCount
        };
      })
    );
    
    res.json(conversationsWithUnreadCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations
};
