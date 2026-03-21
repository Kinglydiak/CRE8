const express = require('express');
const router = express.Router();
const {
  getMentorCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  initiateCoursePayment
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/mentor/:mentorId', getMentorCourses);
router.get('/:id', getCourse);

// Mentor-only routes
router.post('/', protect, authorize('mentor'), createCourse);
router.put('/:id', protect, authorize('mentor'), updateCourse);
router.delete('/:id', protect, authorize('mentor'), deleteCourse);

// Mentee-only payment route
router.post('/:id/pay', protect, authorize('mentee'), initiateCoursePayment);

module.exports = router;
