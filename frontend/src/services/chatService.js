import api from './api';

// Send a message
export const sendMessage = async (messageData) => {
  const response = await api.post('/chats/messages', messageData);
  return response.data;
};

// Get messages between current user and another user
export const getMessages = async (userId) => {
  const response = await api.get(`/chats/messages/${userId}`);
  return response.data;
};

// Get all conversations
export const getConversations = async () => {
  const response = await api.get('/chats/conversations');
  return response.data;
};
