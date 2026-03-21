import axios from 'axios';

const API_URL = '/api/messages';

// Send message
export const sendMessage = async (messageData) => {
  const response = await axios.post(API_URL, messageData);
  return response.data;
};

// Get conversation
export const getConversation = async (userId) => {
  const response = await axios.get(`${API_URL}/conversation/${userId}`);
  return response.data;
};

// Get all conversations
export const getAllConversations = async () => {
  const response = await axios.get(`${API_URL}/conversations`);
  return response.data;
};

// Mark messages as read
export const markAsRead = async (userId) => {
  const response = await axios.put(`${API_URL}/read/${userId}`);
  return response.data;
};
