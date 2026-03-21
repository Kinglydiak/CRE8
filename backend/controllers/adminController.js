const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify mentor
// @route   PUT /api/admin/verify-mentor/:id
// @access  Private (Admin only)
const verifyMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    mentor.isVerified = true;
    await mentor.save();

    res.json({
      success: true,
      message: 'Mentor verified successfully',
      data: mentor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMentors = await Mentor.countDocuments();
    const totalMentees = await User.countDocuments({ role: 'mentee' });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('mentor', 'name email')
      .populate('mentee', 'name email')
      .sort('-createdAt')
      .limit(10);

    // Top mentors by rating
    const topMentors = await Mentor.find()
      .select('name email rating completedSessions')
      .sort('-rating')
      .limit(10);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalMentors,
        totalMentees,
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentBookings,
        topMentors
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  verifyMentor,
  deleteUser,
  getAnalytics
};
