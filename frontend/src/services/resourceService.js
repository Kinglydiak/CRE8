import axios from 'axios';

const API_URL = '/api/resources';

export const getResources = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getResourcesByMentor = async (mentorId) => {
  const response = await axios.get(`${API_URL}/mentor/${mentorId}`);
  return response.data;
};

export const uploadResource = async (resourceData) => {
  const response = await axios.post(API_URL, resourceData);
  return response.data;
};

export const deleteResource = async (resourceId) => {
  const response = await axios.delete(`${API_URL}/${resourceId}`);
  return response.data;
};

export const downloadResource = async (resourceId) => {
  const response = await axios.get(`${API_URL}/${resourceId}`);
  return response.data;
};
