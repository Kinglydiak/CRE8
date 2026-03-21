const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  addFeedback,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('mentee'), createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/status', protect, authorize('mentor', 'admin'), updateBookingStatus);
router.post('/:id/feedback', protect, authorize('mentee'), addFeedback);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
