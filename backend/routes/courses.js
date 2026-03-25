const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getMentorCourses,
  getMentorOwnCourses,
  getCourse,
  getCourseContent,
  createCourse,
  updateCourse,
  deleteCourse,
  initiateCoursePayment
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllCourses);
router.get('/mentor/:mentorId', getMentorCourses);

// Mentor's own courses (all — active + inactive)  — must come before /:id
router.get('/mine', protect, authorize('mentor', 'admin'), getMentorOwnCourses);

router.get('/:id', getCourse);

// Protected — enrolled mentees / mentor owner / admin
router.get('/:id/content', protect, getCourseContent);

// Mentor-only routes
router.post('/', protect, authorize('mentor'), createCourse);
router.put('/:id', protect, authorize('mentor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('mentor', 'admin'), deleteCourse);

// Mentee-only payment route
router.post('/:id/pay', protect, authorize('mentee'), initiateCoursePayment);

module.exports = router;
