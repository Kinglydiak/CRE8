const mongoose = require('mongoose');
const User = require('./User');

const menteeSchema = new mongoose.Schema({
  interests: [{
    type: String,
    trim: true
  }],
  goals: {
    type: String,
    default: ''
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  education: {
    type: String,
    default: ''
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  completedSessions: {
    type: Number,
    default: 0
  }
});

const Mentee = User.discriminator('mentee', menteeSchema);

module.exports = Mentee;
