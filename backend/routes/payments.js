const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { mtnWebhook, pollPaymentStatus, pollTransferStatus } = require('../controllers/paymentController');

// MTN MoMo webhook — no auth (called by MTN servers)
router.post('/mtn-webhook', mtnWebhook);

// Poll status manually (useful in sandbox where webhooks may not fire)
router.get('/status/:referenceId', protect, pollPaymentStatus);
router.get('/transfer-status/:referenceId', protect, authorize('mentor'), pollTransferStatus);

module.exports = router;
