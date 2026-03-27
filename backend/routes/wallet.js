const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getWallet, requestWithdrawal, syncPendingPayments } = require('../controllers/walletController');

router.get('/', protect, authorize('mentor'), getWallet);
router.post('/withdraw', protect, authorize('mentor'), requestWithdrawal);
router.post('/sync-payments', protect, authorize('mentor'), syncPendingPayments);

module.exports = router;
