const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const Mentee = require('../models/Mentee');
const { randomUUID } = require('crypto');
const { requestToPay } = require('../utils/mtnMoMo');

// @desc    Get all active courses (marketplace)
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const { category, level, search, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (level) filter.level = level;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { topics: { $elemMatch: { $regex: search, $options: 'i' } } }
    ];
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    const courses = await Course.find(filter)
      .populate('mentor', 'name profilePicture location rating')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all courses for a specific mentor (public — active only)
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

// @desc    Get all courses owned by the logged-in mentor (active + inactive)
// @route   GET /api/courses/mine
// @access  Mentor only
const getMentorOwnCourses = async (req, res) => {
  try {
    const courses = await Course.find({ mentor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('mentor', 'name profilePicture location rating');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Optionally check enrollment for logged-in users (read token without hard-failing)
    let isEnrolled = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        const viewer = await User.findById(decoded.id).select('role').lean();
        if (viewer) {
          if (viewer.role === 'admin') {
            isEnrolled = true;
          } else if (viewer.role === 'mentor' && course.mentor._id.toString() === decoded.id.toString()) {
            isEnrolled = true;
          } else {
            // Use Mentee model to correctly read enrolledCourses (discriminator field)
            const menteeDoc = await Mentee.findById(decoded.id).select('enrolledCourses').lean();
            isEnrolled = !!(menteeDoc?.enrolledCourses?.some(id => id.toString() === course._id.toString()));
          }
        }
      } catch {
        // Invalid/expired token — treat as guest
      }
    }

    const courseObj = course.toObject();
    courseObj.isEnrolled = isEnrolled;
    res.json({ success: true, data: courseObj });
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

// @desc    Get full course content (modules + lessons) — enrolled user or mentor owner
// @route   GET /api/courses/:id/content
// @access  Private
const getCourseContent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('mentor', 'name profilePicture location rating');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isMentorOwner = course.mentor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isMentorOwner && !isAdmin) {
      // Use Mentee model to correctly read enrolledCourses (discriminator field)
      const menteeDoc = await Mentee.findById(req.user._id).select('enrolledCourses').lean();
      const enrolled = menteeDoc?.enrolledCourses?.some(id => id.toString() === course._id.toString());
      if (!enrolled) {
        return res.status(403).json({ success: false, message: 'You must be enrolled to access this course content.' });
      }
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const transactionRef = `CRE8-${randomUUID().split('-')[0].toUpperCase()}-${Date.now()}`;

    // Increment enrollment count
    await Course.findByIdAndUpdate(req.params.id, { $inc: { enrollments: 1 } });

    // Track enrollment on the mentee (must use Mentee model — User strict mode ignores discriminator fields)
    await Mentee.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: course._id }
    });

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

      // Call MTN Collections API — send push prompt to mentee's phone
      let momoReferenceId = transactionRef;
      try {
        momoReferenceId = await requestToPay({
          amount: course.price,
          currency: course.currency || 'RWF',
          phoneNumber,
          externalId: transactionRef,
          payerMessage: `CRE8: ${course.title}`,
          payeeNote: `Course ${course._id}`
        });
        // Update payment record with MTN's reference ID
        await Payment.findOneAndUpdate(
          { transactionId: transactionRef },
          { transactionId: momoReferenceId }
        );
      } catch (momoErr) {
        console.error('MTN MoMo requestToPay error:', momoErr.message);
        // Payment stays pending — wallet credited via webhook
      }
      // NOTE: wallet credit happens via webhook (POST /api/payments/mtn-webhook)
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

module.exports = { getAllCourses, getMentorCourses, getMentorOwnCourses, getCourse, getCourseContent, createCourse, updateCourse, deleteCourse, initiateCoursePayment };
