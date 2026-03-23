const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, bookingId } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      booking: bookingId || null
    });

    await message.populate('sender', 'name profilePicture role');
    await message.populate('receiver', 'name profilePicture role');

    // Emit real-time event to both sender and receiver rooms
    const io = req.app.get('io');
    if (io) {
      const payload = message.toObject();
      io.to(receiverId.toString()).emit('new_message', payload);
      io.to(req.user._id.toString()).emit('new_message', payload);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture')
      .sort('createdAt');

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getAllConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Aggregate: get the last message content/date for each unique conversation partner
    const rows = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastContent: { $first: '$content' },
          lastCreatedAt: { $first: '$createdAt' }
        }
      }
    ]);

    // Fetch each partner user directly — avoids the aggregate-populate null bug
    const conversations = await Promise.all(
      rows.map(async (row) => {
        const otherUser = await User.findById(row._id)
          .select('name profilePicture role')
          .lean();
        return {
          otherUserId: row._id.toString(),
          otherUser: otherUser
            ? { _id: otherUser._id, name: otherUser.name, profilePicture: otherUser.profilePicture, role: otherUser.role }
            : { _id: row._id, name: 'Unknown User', profilePicture: '' },
          lastMessage: {
            content: row.lastContent,
            createdAt: row.lastCreatedAt
          }
        };
      })
    );

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead
};
