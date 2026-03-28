import axios from 'axios';

const API_URL = '/api/admin';

export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

export const verifyMentor = async (id) => {
  const response = await axios.put(`${API_URL}/verify-mentor/${id}`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/users/${id}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await axios.get(`${API_URL}/analytics`);
  return response.data;
};

export const getAllCoursesAdmin = async () => {
  const response = await axios.get(`${API_URL}/courses`);
  return response.data;
};

export const deleteCourseAdmin = async (id) => {
  const response = await axios.delete(`${API_URL}/courses/${id}`);
  return response.data;
};

export const getAllResourcesAdmin = async () => {
  const response = await axios.get(`${API_URL}/resources`);
  return response.data;
};

export const deleteResourceAdmin = async (id) => {
  const response = await axios.delete(`${API_URL}/resources/${id}`);
  return response.data;
};
