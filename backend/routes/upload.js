const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { protect, authorize } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — files go to Cloudinary, not local disk
const memoryStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Only image files are allowed'), false);
};
const videoFilter = (req, file, cb) => {
  const allowed = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Only video files are allowed'), false);
};

const avatarUpload = multer({ storage: memoryStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const thumbnailUpload = multer({ storage: memoryStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const videoUpload = multer({ storage: memoryStorage, fileFilter: videoFilter, limits: { fileSize: 500 * 1024 * 1024 } });

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(buffer);
  });
};

// POST /api/upload/avatar
router.post('/avatar', protect, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'cre8/avatars');
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/upload/course-thumbnail  (mentor only)
router.post('/course-thumbnail', protect, authorize('mentor', 'admin'), thumbnailUpload.single('thumbnail'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'cre8/thumbnails');
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/upload/course-video  (mentor only)
router.post('/course-video', protect, authorize('mentor', 'admin'), videoUpload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'cre8/videos', 'video');
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
