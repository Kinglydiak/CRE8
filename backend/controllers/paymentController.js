/**
 * MTN MoMo Webhook Handler
 *
 * MTN calls this endpoint when a payment changes status
 * (SUCCESSFUL or FAILED). We update the Payment / Withdrawal
 * records and credit / debit the mentor wallet accordingly.
 *
 * In sandbox mode MTN may not deliver webhooks reliably.
 * Use the GET /api/payments/status/:referenceId endpoint to
 * manually poll from your frontend / admin panel instead.
 */

const Payment = require('../models/Payment');
const Withdrawal = require('../models/Withdrawal');
const Mentor = require('../models/Mentor');
const { getPaymentStatus, getTransferStatus } = require('../utils/mtnMoMo');

// @desc    MTN MoMo webhook — called by MTN when payment status changes
// @route   POST /api/payments/mtn-webhook
// @access  Public (MTN server IP — no JWT)
const mtnWebhook = async (req, res) => {
  try {
    const { referenceId, status, externalId } = req.body;

    if (!referenceId || !status) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    const upperStatus = status.toUpperCase();

    // --- Collections (incoming payment) ---
    const payment = await Payment.findOne({ transactionId: referenceId });
    if (payment) {
      if (upperStatus === 'SUCCESSFUL' && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.paidAt = new Date();
        await payment.save();

        // Credit mentor wallet
        if (payment.mentor) {
          await Mentor.findByIdAndUpdate(payment.mentor, {
            $inc: { walletBalance: payment.amount }
          });
        }
      } else if (upperStatus === 'FAILED') {
        payment.status = 'failed';
        await payment.save();
      }
      return res.status(200).json({ received: true });
    }

    // --- Disbursements (outgoing withdrawal) ---
    const withdrawal = await Withdrawal.findOne({ transactionRef: referenceId });
    if (withdrawal) {
      if (upperStatus === 'SUCCESSFUL') {
        withdrawal.status = 'completed';
        await withdrawal.save();
      } else if (upperStatus === 'FAILED') {
        withdrawal.status = 'failed';
        await withdrawal.save();
        // Refund the mentor's wallet
        await Mentor.findByIdAndUpdate(withdrawal.mentor, {
          $inc: { walletBalance: withdrawal.amount }
        });
      }
      return res.status(200).json({ received: true });
    }

    // Unknown reference — still return 200 so MTN doesn't retry
    res.status(200).json({ received: true, note: 'reference not found' });
  } catch (error) {
    console.error('MTN webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manually poll MTN for a Collections payment status
// @route   GET /api/payments/status/:referenceId
// @access  Private
const pollPaymentStatus = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const result = await getPaymentStatus(referenceId);

    // Sync our DB record
    const payment = await Payment.findOne({ transactionId: referenceId });
    if (payment) {
      if (result.status === 'SUCCESSFUL' && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.paidAt = new Date();
        await payment.save();
        if (payment.mentor) {
          await Mentor.findByIdAndUpdate(payment.mentor, {
            $inc: { walletBalance: payment.amount }
          });
        }
      } else if (result.status === 'FAILED' && payment.status !== 'failed') {
        payment.status = 'failed';
        await payment.save();
      }
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually poll MTN for a Disbursements transfer status
// @route   GET /api/payments/transfer-status/:referenceId
// @access  Private (Mentor only)
const pollTransferStatus = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const result = await getTransferStatus(referenceId);

    const withdrawal = await Withdrawal.findOne({ transactionRef: referenceId });
    if (withdrawal) {
      if (result.status === 'SUCCESSFUL' && withdrawal.status !== 'completed') {
        withdrawal.status = 'completed';
        await withdrawal.save();
      } else if (result.status === 'FAILED' && withdrawal.status !== 'failed') {
        withdrawal.status = 'failed';
        await withdrawal.save();
        await Mentor.findByIdAndUpdate(withdrawal.mentor, {
          $inc: { walletBalance: withdrawal.amount }
        });
      }
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { mtnWebhook, pollPaymentStatus, pollTransferStatus };
