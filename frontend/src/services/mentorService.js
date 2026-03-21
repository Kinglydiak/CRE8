import axios from 'axios';

const API_URL = '/api/mentors';

// Get all mentors
export const getMentors = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await axios.get(`${API_URL}?${params}`);
  return response.data;
};

// Get single mentor
export const getMentor = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Update mentor profile
export const updateMentorProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/profile`, profileData);
  return response.data;
};

// Get mentor availability
export const getMentorAvailability = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/availability`);
  return response.data;
};
