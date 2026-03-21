const mongoose = require('mongoose');
const User = require('./User');

const mentorSchema = new mongoose.Schema({
  skills: [{
    type: String,
    trim: true
  }],
  expertise: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  education: {
    type: String,
    default: ''
  },
  pricePerSession: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  experience: {
    type: String,
    default: ''
  },
  availability: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  certifications: [{
    title: String,
    issuer: String,
    date: Date
  }],
  socialLinks: {
    linkedin: String,
    twitter: String,
    portfolio: String,
    github: String
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  walletCurrency: {
    type: String,
    default: 'RWF'
  }
});

const Mentor = User.discriminator('mentor', mentorSchema);

module.exports = Mentor;
