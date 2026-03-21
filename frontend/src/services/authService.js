import axios from 'axios';

const API_URL = '/api/auth';

// Register user
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

// Logout
export const logout = async () => {
  const response = await axios.post(`${API_URL}/logout`);
  return response.data;
};
