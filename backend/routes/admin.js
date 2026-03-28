const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  verifyMentor,
  deleteUser,
  getAnalytics,
  getAllCoursesAdmin,
  deleteCourseAdmin,
  getAllResourcesAdmin,
  deleteResourceAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/verify-mentor/:id', verifyMentor);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);
router.get('/courses', getAllCoursesAdmin);
router.delete('/courses/:id', deleteCourseAdmin);
router.get('/resources', getAllResourcesAdmin);
router.delete('/resources/:id', deleteResourceAdmin);

module.exports = router;
