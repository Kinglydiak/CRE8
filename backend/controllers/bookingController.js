const Booking = require('../models/Booking');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const Payment = require('../models/Payment');
const sendEmail = require('../utils/sendEmail');
const { requestToPay } = require('../utils/mtnMoMo');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Mentee only)
const createBooking = async (req, res) => {
  try {
    const { mentorId, sessionDate, duration, topic, notes, phoneNumber, paymentMethod } = req.body;

    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Require payment details when mentor charges for sessions
    const sessionPrice = mentor.pricePerSession || 0;
    if (sessionPrice > 0 && !phoneNumber) {
      return res.status(400).json({ message: 'Payment details are required to book this mentor' });
    }

    // Check if mentor is available at that time
    const existingBooking = await Booking.findOne({
      mentor: mentorId,
      sessionDate: new Date(sessionDate),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Mentor is not available at this time' });
    }

    // Calculate amount based on duration and hourly rate
    const hours = Number(duration) / 60;
    const amount = Math.round(hours * sessionPrice);

    // Create booking
    const booking = await Booking.create({
      mentee: req.user._id,
      mentor: mentorId,
      sessionDate: new Date(sessionDate),
      duration,
      topic,
      notes,
      status: 'pending'
    });

    // Create payment record if there is a cost
    let transactionRef = null;
    if (amount > 0 && phoneNumber) {
      const { randomUUID } = require('crypto');
      transactionRef = randomUUID();
      await Payment.create({
        booking: booking._id,
        mentor: mentorId,
        paymentFor: 'booking',
        payer: req.user._id,
        amount,
        currency: 'RWF',
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
          amount,
          currency: 'RWF',
          phoneNumber,
          externalId: transactionRef,
          payerMessage: `CRE8 session with ${mentor.name}`,
          payeeNote: `Booking ${booking._id}`
        });
        // Update payment record with MTN reference
        await Payment.findOneAndUpdate(
          { transactionId: transactionRef },
          { transactionId: momoReferenceId }
        );
      } catch (momoErr) {
        console.error('MTN MoMo requestToPay error:', momoErr.message);
        // Payment record stays pending — do NOT credit wallet until confirmed
      }
      // NOTE: wallet credit now happens via webhook (POST /api/payments/mtn-webhook)
      // Provisional credit removed to avoid double-crediting
    }

    // Populate booking details
    await booking.populate('mentor', 'name email');
    await booking.populate('mentee', 'name email');

    // Send notification emails
    try {
      await sendEmail({
        email: mentor.email,
        subject: 'New Booking Request - Cre8',
        message: `You have a new booking request from ${req.user.name} for ${new Date(sessionDate).toLocaleString()}`
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    res.status(201).json({
      success: true,
      data: {
        booking,
        transactionRef,
        phoneNumber,
        amount,
        momoStatus: amount > 0 ? 'prompt_sent' : 'free'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for current user
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'mentee') {
      query.mentee = req.user._id;
    } else if (req.user.role === 'mentor') {
      query.mentor = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('mentor', 'name email profilePicture expertise')
      .populate('mentee', 'name email profilePicture')
      .populate('payment', 'amount currency paymentMethod transactionId status')
      .sort('-sessionDate');

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('mentor', 'name email profilePicture skills')
      .populate('mentee', 'name email profilePicture')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (
      booking.mentee._id.toString() !== req.user._id.toString() &&
      booking.mentor._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Mentor/Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    if (req.body.meetingLink !== undefined) {
      booking.meetingLink = req.body.meetingLink.trim();
    }
    const updatedBooking = await booking.save();

    // Notify mentee about confirmation + meeting link
    if (status === 'confirmed') {
      try {
        await booking.populate('mentee', 'name email');
        const linkLine = booking.meetingLink
          ? `\n\nJoin your session here: ${booking.meetingLink}`
          : '';
        await sendEmail({
          email: booking.mentee.email,
          subject: 'Session Confirmed - Cre8',
          message: `Great news! Your session on ${new Date(booking.sessionDate).toLocaleString()} has been confirmed.${linkLine}`
        });
      } catch (e) {
        console.error('Confirmation email failed:', e.message);
      }
    }

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add feedback to booking
// @route   POST /api/bookings/:id/feedback
// @access  Private (Mentee only)
const addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the mentee
    if (booking.mentee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add feedback' });
    }

    // Check if session is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed sessions' });
    }

    booking.feedback = {
      rating,
      comment,
      createdAt: Date.now()
    };

    await booking.save();

    // Update mentor's average rating
    const mentor = await Mentor.findById(booking.mentor);
    const totalRating = mentor.rating * mentor.totalRatings + rating;
    mentor.totalRatings += 1;
    mentor.rating = totalRating / mentor.totalRatings;
    await mentor.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (
      booking.mentee.toString() !== req.user._id.toString() &&
      booking.mentor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  addFeedback,
  cancelBooking
};
