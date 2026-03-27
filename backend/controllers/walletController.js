const Mentor = require('../models/Mentor');
const Payment = require('../models/Payment');
const Withdrawal = require('../models/Withdrawal');
const { randomUUID } = require('crypto');
const { transfer, getPaymentStatus } = require('../utils/mtnMoMo');

// @desc    Get mentor wallet (balance + history)
// @route   GET /api/wallet
// @access  Mentor only
const getWallet = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.user._id).select('walletBalance walletCurrency');
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    // Recent incoming payments credited to this mentor
    const payments = await Payment.find({ mentor: req.user._id })
      .sort('-createdAt')
      .limit(20)
      .populate('payer', 'name')
      .lean();

    // Recent withdrawals by this mentor
    const withdrawals = await Withdrawal.find({ mentor: req.user._id })
      .sort('-createdAt')
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: {
        balance: mentor.walletBalance || 0,
        currency: mentor.walletCurrency || 'RWF',
        payments,
        withdrawals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a payout (withdraw from wallet)
// @route   POST /api/wallet/withdraw
// @access  Mentor only
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, phoneNumber, paymentMethod, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Enter a valid withdrawal amount' });
    }
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Mobile money phone number is required' });
    }

    const mentor = await Mentor.findById(req.user._id);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    const balance = mentor.walletBalance || 0;
    if (amount > balance) {
      return res.status(400).json({ success: false, message: `Insufficient balance. Available: ${balance} ${mentor.walletCurrency || 'RWF'}` });
    }

    const transactionRef = `WD-${randomUUID().split('-')[0].toUpperCase()}-${Date.now()}`;

    // Deduct from wallet
    mentor.walletBalance = parseFloat((balance - amount).toFixed(2));
    await mentor.save();

    // Record withdrawal
    const withdrawal = await Withdrawal.create({
      mentor: req.user._id,
      amount,
      currency: mentor.walletCurrency || 'RWF',
      phoneNumber,
      paymentMethod: paymentMethod || 'mtn_momo',
      transactionRef,
      notes: notes || '',
      status: 'pending'
    });

    // Call MTN Disbursements API to push funds to mentor's phone
    let momoReferenceId = transactionRef;
    try {
      momoReferenceId = await transfer({
        amount,
        currency: mentor.walletCurrency || 'RWF',
        phoneNumber,
        externalId: transactionRef,
        payerMessage: `CRE8 payout to ${req.user.name}`,
        payeeNote: `Withdrawal ${withdrawal._id}`
      });
      await Withdrawal.findByIdAndUpdate(withdrawal._id, {
        transactionRef: momoReferenceId,
        status: 'processing'
      });
    } catch (momoErr) {
      console.error('MTN MoMo transfer error:', momoErr.message);
      // Refund the deducted balance since the transfer failed
      mentor.walletBalance = parseFloat((mentor.walletBalance + amount).toFixed(2));
      await mentor.save();
      await Withdrawal.findByIdAndUpdate(withdrawal._id, { status: 'failed' });
      return res.status(502).json({
        success: false,
        message: 'Mobile money transfer failed. Your balance has been restored. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Withdrawal initiated. Funds will be sent to your mobile money account.',
      data: {
        withdrawal,
        newBalance: mentor.walletBalance,
        currency: mentor.walletCurrency || 'RWF'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Poll MTN for all pending incoming payments and credit wallet if completed
// @route   POST /api/wallet/sync-payments
// @access  Mentor only
const syncPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await Payment.find({
      mentor: req.user._id,
      status: 'pending'
    });

    if (!pendingPayments.length) {
      return res.json({ success: true, credited: 0, message: 'No pending payments to sync' });
    }

    let credited = 0;
    for (const payment of pendingPayments) {
      try {
        const result = await getPaymentStatus(payment.transactionId);
        if (result.status === 'SUCCESSFUL' && payment.status !== 'completed') {
          payment.status = 'completed';
          payment.paidAt = new Date();
          await payment.save();
          await Mentor.findByIdAndUpdate(payment.mentor, {
            $inc: { walletBalance: payment.amount }
          });
          credited += payment.amount;
        } else if (result.status === 'FAILED') {
          payment.status = 'failed';
          await payment.save();
        }
      } catch (pollErr) {
        console.error(`[syncPendingPayments] poll failed for ${payment.transactionId}:`, pollErr.message);
      }
    }

    const mentor = await Mentor.findById(req.user._id).select('walletBalance walletCurrency');
    res.json({
      success: true,
      credited,
      newBalance: mentor.walletBalance,
      currency: mentor.walletCurrency || 'RWF',
      message: credited > 0
        ? `Wallet updated — ${credited.toLocaleString()} ${mentor.walletCurrency || 'RWF'} credited`
        : 'No newly completed payments found'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWallet, requestWithdrawal, syncPendingPayments };
