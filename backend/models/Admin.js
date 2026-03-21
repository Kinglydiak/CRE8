const mongoose = require('mongoose');
const User = require('./User');

const adminSchema = new mongoose.Schema({
  permissions: [{
    type: String,
    enum: ['user_management', 'mentor_verification', 'content_moderation', 'analytics', 'system_config'],
    default: ['user_management', 'mentor_verification', 'content_moderation']
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

const Admin = User.discriminator('admin', adminSchema);

module.exports = Admin;
