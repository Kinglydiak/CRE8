import axios from 'axios';

const API_URL = '/api/courses';

// Get all courses for a mentor
export const getMentorCourses = async (mentorId) => {
  const response = await axios.get(`${API_URL}/mentor/${mentorId}`);
  return response.data;
};

// Get a single course
export const getCourse = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create a course (mentor)
export const createCourse = async (courseData) => {
  const response = await axios.post(API_URL, courseData);
  return response.data;
};

// Update a course (mentor)
export const updateCourse = async (id, courseData) => {
  const response = await axios.put(`${API_URL}/${id}`, courseData);
  return response.data;
};

// Delete a course (mentor)
export const deleteCourse = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Initiate course payment (mentee)
export const initiatePayment = async (courseId, paymentData) => {
  const response = await axios.post(`${API_URL}/${courseId}/pay`, paymentData);
  return response.data;
};
