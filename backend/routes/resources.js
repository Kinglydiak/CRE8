const express = require('express');
const router = express.Router();
const {
  uploadResource,
  getResources,
  getResourcesByMentor,
  getResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('mentor'), uploadResource);
router.get('/', protect, getResources);
router.get('/mentor/:mentorId', getResourcesByMentor);
router.get('/:id', protect, getResource);
router.delete('/:id', protect, authorize('mentor', 'admin'), deleteResource);

module.exports = router;
