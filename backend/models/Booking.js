const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60, // minutes
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  topic: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: ''
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
bookingSchema.index({ mentee: 1, sessionDate: 1 });
bookingSchema.index({ mentor: 1, sessionDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
