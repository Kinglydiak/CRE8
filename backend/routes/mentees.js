const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Mentee = require('../models/Mentee');
const Course = require('../models/Course');

// @desc    Get enrolled courses for a mentee
// @route   GET /api/mentees/my-courses
// @access  Private (mentee only)
router.get('/my-courses', protect, authorize('mentee'), async (req, res) => {
  try {
    // Must use Mentee model — User base model doesn't expose the enrolledCourses discriminator field
    const mentee = await Mentee.findById(req.user._id).select('enrolledCourses').lean();
    const enrolledIds = mentee?.enrolledCourses || [];
    const courses = await Course.find({ _id: { $in: enrolledIds } })
      .populate('mentor', 'name profilePicture');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update mentee profile
// @route   PUT /api/mentees/profile
// @access  Private (mentee only)
router.put('/profile', protect, authorize('mentee'), async (req, res) => {
  try {
    const { name, bio, location, phone, profilePicture, interests, goals, skillLevel, education } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    if (phone !== undefined) updateFields.phone = phone;
    if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;
    if (interests !== undefined) updateFields.interests = interests;
    if (goals !== undefined) updateFields.goals = goals;
    if (skillLevel !== undefined) updateFields.skillLevel = skillLevel;
    if (education !== undefined) updateFields.education = education;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
