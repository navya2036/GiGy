const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Active users map to keep track of online users
const activeUsers = new Map();

const socketHandler = (io) => {
  // Middleware to authenticate users
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Add user to active users
    activeUsers.set(socket.user._id.toString(), socket.id);
    
    // Emit online users to everyone
    io.emit('getOnlineUsers', Array.from(activeUsers.keys()));
    
    // Listen for new messages
    socket.on('sendMessage', async (messageData) => {
      try {
        const { recipientId, message } = messageData;
        
        // Create conversation ID
        const conversationId = Message.createConversationId(
          socket.user._id.toString(),
          recipientId
        );
        
        // Create or update conversation
        let conversation = await Conversation.findOne({ conversationId });
        
        if (!conversation) {
          conversation = new Conversation({
            participants: [socket.user._id, recipientId],
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
          sender: socket.user._id,
          recipient: recipientId,
          message,
          conversationId
        });
        
        const savedMessage = await newMessage.save();
        await savedMessage.populate('sender', 'name email profilePicture');
        
        // Send to recipient if online
        const recipientSocketId = activeUsers.get(recipientId);
        
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newMessage', savedMessage);
        }
        
        // Send confirmation to sender
        socket.emit('messageSent', savedMessage);
      } catch (error) {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'Message could not be sent' });
      }
    });
    
    // Handle typing status
    socket.on('typing', ({ recipientId }) => {
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('userTyping', {
          userId: socket.user._id
        });
      }
    });
    
    socket.on('stopTyping', ({ recipientId }) => {
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('userStoppedTyping', {
          userId: socket.user._id
        });
      }
    });
    
    // Handle read messages
    socket.on('markAsRead', async ({ conversationId }) => {
      try {
        // Mark messages as read
        await Message.updateMany(
          { 
            conversationId,
            recipient: socket.user._id,
            read: false
          },
          { read: true }
        );
        
        // Find the other participant in the conversation
        const conversation = await Conversation.findOne({ conversationId });
        const otherParticipantId = conversation.participants.find(
          p => p.toString() !== socket.user._id.toString()
        );
        
        // Notify the other user if online
        const otherUserSocketId = activeUsers.get(otherParticipantId.toString());
        
        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit('messagesRead', {
            userId: socket.user._id,
            conversationId
          });
        }
      } catch (error) {
        console.error('Socket error:', error);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
      activeUsers.delete(socket.user._id.toString());
      
      // Emit updated online users to everyone
      io.emit('getOnlineUsers', Array.from(activeUsers.keys()));
    });
  });
};

module.exports = socketHandler;
