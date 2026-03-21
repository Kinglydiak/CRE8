const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getAllConversations);
router.get('/conversation/:userId', protect, getConversation);
router.put('/read/:userId', protect, markAsRead);

module.exports = router;
