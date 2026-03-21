const Resource = require('../models/Resource');
const Mentor = require('../models/Mentor');

// @desc    Upload a resource
// @route   POST /api/resources
// @access  Private (Mentor only)
const uploadResource = async (req, res) => {
  try {
    const { title, description, fileUrl, fileType, category, accessLevel, bookingId } = req.body;

    // Validate required fields
    if (!title || !fileUrl || !fileType) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide title, fileUrl, and fileType' 
      });
    }

    const resource = await Resource.create({
      mentor: req.user._id,
      title,
      description,
      fileUrl,
      fileType,
      category: category || 'general',
      accessLevel: accessLevel || 'mentees_only',
      booking: bookingId || null
    });

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to upload resource'
    });
  }
};

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  try {
    let query = {};

    // If mentee, only show public or accessible resources
    if (req.user.role === 'mentee') {
      query.$or = [
        { accessLevel: 'public' },
        { accessLevel: 'mentees_only' }
      ];
    }

    // If mentor, show only their resources
    if (req.user.role === 'mentor') {
      query.mentor = req.user._id;
    }

    const resources = await Resource.find(query)
      .populate('mentor', 'name profilePicture')
      .sort('-createdAt');

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get resources by mentor
// @route   GET /api/resources/mentor/:mentorId
// @access  Public
const getResourcesByMentor = async (req, res) => {
  try {
    const resources = await Resource.find({
      mentor: req.params.mentorId,
      accessLevel: { $in: ['public', 'mentees_only'] }
    })
      .populate('mentor', 'name profilePicture')
      .sort('-createdAt');

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('mentor', 'name profilePicture');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Mentor/Admin)
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check authorization
    if (resource.mentor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadResource,
  getResources,
  getResourcesByMentor,
  getResource,
  deleteResource
};
