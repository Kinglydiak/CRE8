const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getWallet, requestWithdrawal } = require('../controllers/walletController');

router.get('/', protect, authorize('mentor'), getWallet);
router.post('/withdraw', protect, authorize('mentor'), requestWithdrawal);

module.exports = router;
