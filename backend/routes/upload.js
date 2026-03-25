const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');

// Ensure upload directories exist
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
ensureDir(path.join(__dirname, '../uploads/avatars'));
ensureDir(path.join(__dirname, '../uploads/courses/thumbnails'));
ensureDir(path.join(__dirname, '../uploads/courses/videos'));

// ── Avatar upload ──────────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  }
});
const avatarFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Only image files are allowed'), false);
};
const avatarUpload = multer({ storage: avatarStorage, fileFilter: avatarFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/upload/avatar
router.post('/avatar', protect, avatarUpload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/avatars/${req.file.filename}` });
});

// ── Course thumbnail upload ────────────────────────────────────────────────
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/courses/thumbnails')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `thumb-${req.user._id}-${Date.now()}${ext}`);
  }
});
const thumbnailFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Only image files are allowed'), false);
};
const thumbnailUpload = multer({ storage: thumbnailStorage, fileFilter: thumbnailFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload/course-thumbnail  (mentor only)
router.post('/course-thumbnail', protect, authorize('mentor', 'admin'), thumbnailUpload.single('thumbnail'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/courses/thumbnails/${req.file.filename}` });
});

// ── Course video upload ────────────────────────────────────────────────────
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/courses/videos')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `video-${req.user._id}-${Date.now()}${ext}`);
  }
});
const videoFilter = (req, file, cb) => {
  const allowed = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Only video files are allowed'), false);
};
const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB
});

// POST /api/upload/course-video  (mentor only)
router.post('/course-video', protect, authorize('mentor', 'admin'), videoUpload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/courses/videos/${req.file.filename}` });
});

module.exports = router;
