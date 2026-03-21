const User = require('../models/User');
const Mentor = require('../models/Mentor');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
const getMentors = async (req, res) => {
  try {
    const { skills, minPrice, maxPrice, rating, search, available } = req.query;
    
    let query = { role: 'mentor' };
    let andConditions = [];

    // Filter by skills/expertise
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      andConditions.push({
        $or: [
          { skills: { $in: skillArray } },
          { expertise: { $in: skillArray } }
        ]
      });
    }

    // Search by name or expertise
    if (search) {
      const searchWords = search.trim().split(/\s+/).filter(w => w.length > 0);
      const wordOrConditions = searchWords.flatMap(word => [
        { name: { $regex: word, $options: 'i' } },
        { expertise: { $elemMatch: { $regex: word, $options: 'i' } } },
        { bio: { $regex: word, $options: 'i' } }
      ]);
      andConditions.push({ $or: wordOrConditions });
    }

    // Combine $or conditions with $and if multiple exist
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.pricePerSession = {};
      if (minPrice) query.pricePerSession.$gte = Number(minPrice);
      if (maxPrice) query.pricePerSession.$lte = Number(maxPrice);
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Filter by availability
    if (available === 'true') {
      query.availability = { $exists: true, $ne: [] };
    }

    const mentors = await User.find(query).select('-password');
    
    res.json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
const getMentor = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id).select('-password');

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ 
        success: false,
        message: 'Mentor not found' 
      });
    }

    res.json({
      success: true,
      data: mentor
    });
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update mentor profile
// @route   PUT /api/mentors/profile
// @access  Private (Mentor only)
const updateMentorProfile = async (req, res) => {
  try {
    // Use User model to find since req.user comes from User model
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Update fields that exist in User schema
    const {
      name,
      email,
      bio,
      profilePicture,
      phone,
      location,
      skills,
      expertise,
      pricePerSession,
      experience,
      availability,
      languages,
      education,
      certifications,
      socialLinks
    } = req.body;

    // Update User base fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;

    // Update Mentor-specific fields
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
    if (expertise !== undefined) user.expertise = Array.isArray(expertise) ? expertise : [];
    if (languages !== undefined) user.languages = Array.isArray(languages) ? languages : [];
    if (education !== undefined) user.education = education;
    if (pricePerSession !== undefined) user.pricePerSession = Number(pricePerSession);
    if (experience !== undefined) user.experience = experience;
    
    // Handle availability - convert simple array to expected format if needed
    if (availability !== undefined) {
      if (Array.isArray(availability)) {
        // If it's a simple array of day strings, keep it simple
        user.availability = availability;
      }
    }
    
    if (certifications !== undefined) user.certifications = certifications;
    if (socialLinks !== undefined) user.socialLinks = socialLinks;

    const updatedUser = await user.save();

    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Update mentor profile error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// @desc    Get mentor availability
// @route   GET /api/mentors/:id/availability
// @access  Public
const getMentorAvailability = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).select('availability');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.json({
      success: true,
      data: mentor.availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMentors,
  getMentor,
  updateMentorProfile,
  getMentorAvailability
};
