import axios from 'axios';

const API_URL = '/api/courses';

// Get all active courses (marketplace)
export const getAllCourses = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.level) params.append('level', filters.level);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
  const response = await axios.get(`${API_URL}?${params.toString()}`);
  return response.data;
};

// Get enrolled courses for logged-in mentee
export const getEnrolledCourses = async () => {
  const response = await axios.get('/api/mentees/my-courses');
  return response.data;
};

// Get all courses for a mentor (public — active only)
export const getMentorCourses = async (mentorId) => {
  const response = await axios.get(`${API_URL}/mentor/${mentorId}`);
  return response.data;
};

// Get all courses owned by the logged-in mentor (active + inactive)
export const getMentorOwnCourses = async () => {
  const response = await axios.get(`${API_URL}/mine`);
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

// Get full course content (modules + lessons) — enrollment-gated
export const getCourseContent = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/content`);
  return response.data;
};

// Upload course thumbnail (returns { url })
export const uploadCourseThumbnail = async (formData) => {
  const response = await axios.post('/api/upload/course-thumbnail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Upload course video (returns { url })
export const uploadCourseVideo = async (formData, onUploadProgress) => {
  const response = await axios.post('/api/upload/course-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return response.data;
};

