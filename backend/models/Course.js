const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'RWF'
  },
  duration: {
    type: String,
    default: ''  // e.g., "4 weeks", "10 hours"
  },
  category: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels'
  },
  topics: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollments: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

courseSchema.index({ mentor: 1 });
courseSchema.index({ category: 1 });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
