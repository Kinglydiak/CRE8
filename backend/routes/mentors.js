const express = require('express');
const router = express.Router();
const {
  getMentors,
  getMentor,
  updateMentorProfile,
  getMentorAvailability
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getMentors);
router.get('/:id', getMentor);
router.put('/profile', protect, authorize('mentor'), updateMentorProfile);
router.get('/:id/availability', getMentorAvailability);

module.exports = router;
