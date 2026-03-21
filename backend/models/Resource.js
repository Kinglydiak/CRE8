const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['document', 'video', 'audio', 'link', 'pdf', 'other'],
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  accessLevel: {
    type: String,
    enum: ['public', 'mentees_only', 'specific_booking'],
    default: 'mentees_only'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
