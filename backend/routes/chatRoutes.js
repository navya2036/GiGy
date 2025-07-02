const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  sendMessage, 
  getMessages, 
  getConversations 
} = require('../controllers/chatController');

// All routes are protected
router.post('/messages', protect, sendMessage);
router.get('/messages/:userId', protect, getMessages);
router.get('/conversations', protect, getConversations);

module.exports = router;
