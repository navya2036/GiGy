import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import './ChatPage.css';

const ChatPage = () => {
  const { userId } = useParams();
  const { userInfo } = useContext(AuthContext);
  const { socket, sendMessage, startTyping, stopTyping, markMessagesAsRead, onlineUsers } = useContext(SocketContext);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const conversationId = [userInfo?._id, userId].sort().join('_');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/chats/messages/${userId}`,
          config
        );
        
        setMessages(data);
      } catch (err) {
        setError('Failed to fetch messages. Please try again.');
      }
    };
    
    const fetchOtherUser = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/users/${userId}`);
        setOtherUser(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user details. Please try again.');
        setLoading(false);
      }
    };
    
    if (userInfo) {
      fetchMessages();
      fetchOtherUser();
      markMessagesAsRead(conversationId);
    }
  }, [userInfo, userId, conversationId, markMessagesAsRead]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    const handleNewMessage = (newMessage) => {
      if (
        newMessage.sender._id === userId || 
        newMessage.sender === userId ||
        newMessage.recipient === userId
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        markMessagesAsRead(conversationId);
      }
    };

    // Listen for typing indicators
    const handleTyping = (data) => {
      if (data.userId === userId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.userId === userId) {
        setIsTyping(false);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('userStoppedTyping', handleStopTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.off('userStoppedTyping', handleStopTyping);
    };
  }, [socket, userId, conversationId, markMessagesAsRead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendMessage(userId, message);
    setMessage('');
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    startTyping(userId);
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a new timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(userId);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="loading-container">
            <p>Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="error-container">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isUserOnline = onlineUsers.includes(userId);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <Link to="/messages" className="back-link">
          ← Back to Messages
        </Link>
        
        <div className="chat-header">
          <div className="chat-profile">
            {otherUser?.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.name}
                className="profile-image"
              />
            ) : (
              <div className="profile-placeholder">
                {otherUser?.name.charAt(0)}
              </div>
            )}
            
            {isUserOnline && <div className="online-indicator" />}
          </div>
          
          <div className="chat-user-info">
            <h2>{otherUser?.name}</h2>
            <p className="user-status">{isUserOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <p className="empty-messages">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const isSentByMe = msg.sender === userInfo._id || msg.sender._id === userInfo._id;
              
              return (
                <div 
                  key={msg._id} 
                  className={`message-bubble ${isSentByMe ? 'sent' : ''}`}
                >
                  <div className="message-content">
                    <p className="message-text">{msg.message}</p>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          
          {isTyping && (
            <div className="typing-indicator">
              {otherUser?.name} is typing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="message-input"
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!message.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
