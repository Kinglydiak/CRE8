import axios from 'axios';

const API_URL = '/api/bookings';

// Create booking
export const createBooking = async (bookingData) => {
  const response = await axios.post(API_URL, bookingData);
  return response.data;
};

// Get all bookings
export const getBookings = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single booking
export const getBooking = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Update booking status (optionally include meetingLink when confirming)
export const updateBookingStatus = async (id, status, meetingLink) => {
  const body = { status };
  if (meetingLink !== undefined) body.meetingLink = meetingLink;
  const response = await axios.put(`${API_URL}/${id}/status`, body);
  return response.data;
};

// Add feedback
export const addFeedback = async (id, feedback) => {
  const response = await axios.post(`${API_URL}/${id}/feedback`, feedback);
  return response.data;
};

// Cancel booking
export const cancelBooking = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
