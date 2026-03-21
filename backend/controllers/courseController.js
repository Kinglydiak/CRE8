const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Mentor = require('../models/Mentor');
const { randomUUID } = require('crypto');

// @desc    Get all courses for a specific mentor
// @route   GET /api/courses/mentor/:mentorId
// @access  Public
const getMentorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ mentor: req.params.mentorId, isActive: true });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('mentor', 'name profilePicture');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Mentor only
const createCourse = async (req, res) => {
  try {
    const { title, description, price, currency, duration, category, level, topics, thumbnail } = req.body;

    const course = await Course.create({
      mentor: req.user._id,
      title,
      description,
      price,
      currency: currency || 'XOF',
      duration,
      category,
      level,
      topics: Array.isArray(topics) ? topics : (topics ? topics.split(',').map(t => t.trim()).filter(Boolean) : []),
      thumbnail
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Mentor only (owns the course)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    const { topics, ...rest } = req.body;
    if (topics !== undefined) {
      rest.topics = Array.isArray(topics) ? topics : topics.split(',').map(t => t.trim()).filter(Boolean);
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete (deactivate) a course
// @route   DELETE /api/courses/:id
// @access  Mentor only (owns the course)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initiate payment for a course (MTN Mobile Money placeholder)
// @route   POST /api/courses/:id/pay
// @access  Mentee only
const initiateCoursePayment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const { phoneNumber, paymentMethod } = req.body;
    if (!phoneNumber) return res.status(400).json({ success: false, message: 'Phone number is required for mobile money payment' });

    // TODO: Integrate MTN MoMo sandbox here
    const transactionRef = `CRE8-${randomUUID().split('-')[0].toUpperCase()}-${Date.now()}`;

    // Increment enrollment count
    await Course.findByIdAndUpdate(req.params.id, { $inc: { enrollments: 1 } });

    // Record payment & credit mentor wallet
    if (course.price > 0) {
      await Payment.create({
        course: course._id,
        mentor: course.mentor,
        paymentFor: 'course',
        payer: req.user._id,
        amount: course.price,
        currency: course.currency,
        phoneNumber,
        paymentMethod: paymentMethod || 'mtn_momo',
        paymentGateway: paymentMethod || 'mtn_momo',
        transactionId: transactionRef,
        status: 'pending'
      });

      // Credit mentor wallet (provisional)
      await Mentor.findByIdAndUpdate(course.mentor, { $inc: { walletBalance: course.price } });
    }

    res.json({
      success: true,
      message: 'Payment initiated. Approve the prompt on your phone.',
      data: {
        transactionRef,
        amount: course.price,
        currency: course.currency,
        courseTitle: course.title,
        phoneNumber,
        paymentMethod: paymentMethod || 'mtn_momo',
        status: 'pending'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMentorCourses, getCourse, createCourse, updateCourse, deleteCourse, initiateCoursePayment };
