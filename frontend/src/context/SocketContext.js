import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { userInfo } = useContext(AuthContext);

  // Initialize socket when user is logged in
  useEffect(() => {
    let newSocket;

    if (userInfo && userInfo.token) {
      newSocket = io(process.env.REACT_APP_SOCKET_URL, {
        auth: {
          token: userInfo.token,
        },
      });

      setSocket(newSocket);

      // Handle socket events
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [userInfo]);

  // Function to send a message
  const sendMessage = (recipientId, message) => {
    if (socket) {
      socket.emit('sendMessage', { recipientId, message });
    }
  };

  // Function to notify when user starts typing
  const startTyping = (recipientId) => {
    if (socket) {
      socket.emit('typing', { recipientId });
    }
  };

  // Function to notify when user stops typing
  const stopTyping = (recipientId) => {
    if (socket) {
      socket.emit('stopTyping', { recipientId });
    }
  };

  // Function to mark messages as read
  const markMessagesAsRead = (conversationId) => {
    if (socket) {
      socket.emit('markAsRead', { conversationId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        sendMessage,
        startTyping,
        stopTyping,
        markMessagesAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
