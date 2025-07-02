import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import './MessagesPage.css';

const MessagesPage = () => {
  const { userInfo } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add formatMessageTime function
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // If less than 24 hours, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If less than 7 days, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/chats/conversations`,
          config
        );
        
        setConversations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch conversations. Please try again.');
        setLoading(false);
      }
    };
    
    if (userInfo) {
      fetchConversations();
    }
  }, [userInfo]);

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
      </div>
      
      <div className="conversations-container">
        {loading ? (
          <div className="loading-container">
            <p>Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-container">
            <p>No conversations yet. Start chatting with someone!</p>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map((conversation) => {
              const otherUser = conversation.participants[0];
              const isOnline = onlineUsers.includes(otherUser._id);
              
              return (
                <Link 
                  key={conversation._id} 
                  to={`/messages/${otherUser._id}`}
                  className="conversation-link"
                >
                  <div className={`conversation-card ${conversation.unread ? 'unread' : ''}`}>
                    <div className="avatar-container">
                      {otherUser.profilePicture ? (
                        <img
                          src={otherUser.profilePicture}
                          alt={otherUser.name}
                          className="avatar"
                        />
                      ) : (
                        <div className="avatar">{otherUser.name.charAt(0)}</div>
                      )}
                      {isOnline && (
                        <div className="online-indicator" />
                      )}
                    </div>
                    
                    <div className="conversation-info">
                      <h3 className="conversation-name">
                        {otherUser.name}
                        {conversation.unreadCount > 0 && (
                          <span className="unread-badge">{conversation.unreadCount}</span>
                        )}
                      </h3>
                    </div>

                    <span className="conversation-time">
                      {formatMessageTime(conversation.lastMessageDate)}
                    </span>

                    <p className="conversation-preview">
                      {conversation.lastMessage.length > 50 
                        ? `${conversation.lastMessage.substring(0, 50)}...` 
                        : conversation.lastMessage}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
