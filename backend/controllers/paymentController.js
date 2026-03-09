// ═══════════════════════════════════════════════════════
// controllers/paymentController.js — Razorpay Integration
// ═══════════════════════════════════════════════════════

const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { PRICING } = require('../config/constants');

// Initialize Razorpay (lazy — only when keys are configured)
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

// ─────────────────────────────────────────────────────
// POST /api/payments/create-order — Create Razorpay order
// ─────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'basic_monthly', 'basic_yearly', etc.

    const amount = PRICING[plan];
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `order_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan,
        email: req.user.email
      }
    });

    // Save pending payment
    await Payment.create({
      userId: req.user._id,
      amount,
      plan,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan,
        key: process.env.RAZORPAY_KEY_ID // Client needs this
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// POST /api/payments/verify — Verify Razorpay payment
// ─────────────────────────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed — invalid signature'
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'success',
        paidAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Determine subscription details
    const isBasic = payment.plan.startsWith('basic');
    const isYearly = payment.plan.endsWith('yearly');
    const subscriptionStatus = isBasic ? 'paid_basic' : 'paid_premium';
    const durationMs = isYearly
      ? 365 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;

    // Update user subscription
    const user = await User.findByIdAndUpdate(
      payment.userId,
      {
        subscriptionStatus,
        subscriptionPlan: isYearly ? 'yearly' : 'monthly',
        subscriptionStartDate: new Date(),
        subscriptionExpiry: new Date(Date.now() + durationMs),
        razorpayPaymentId: razorpay_payment_id,
        amountPaid: payment.amount
      },
      { new: true }
    ).select('name email subscriptionStatus subscriptionExpiry');

    res.status(200).json({
      success: true,
      message: '🎉 Payment successful! Your subscription is now active.',
      data: {
        payment: {
          id: payment._id,
          plan: payment.plan,
          amount: payment.amount,
          status: payment.status
        },
        subscription: {
          status: user.subscriptionStatus,
          expiresAt: user.subscriptionExpiry
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// GET /api/payments/history — Get payment history
// ─────────────────────────────────────────────────────
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// GET /api/payments/plans — Get available plans & pricing
// ─────────────────────────────────────────────────────
const getPlans = async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        billingCycle: null,
        features: [
          'Daily verse via WhatsApp (manual interaction required)',
          'Must send ANY message to get today\'s verse',
          'No auto-delivery guarantee',
          'Email summary once/week'
        ]
      },
      {
        id: 'basic_monthly',
        name: 'Basic',
        price: PRICING.basic_monthly,
        billingCycle: 'monthly',
        features: [
          'AUTO-DELIVERY guaranteed at chosen time',
          'Daily verse via WhatsApp (no action needed)',
          'Daily email with beautiful HTML template',
          'Weekend reflection questions',
          'Streak counter & gamification'
        ]
      },
      {
        id: 'basic_yearly',
        name: 'Basic',
        price: PRICING.basic_yearly,
        billingCycle: 'yearly',
        savings: `Save ₹${PRICING.basic_monthly * 12 - PRICING.basic_yearly}`,
        features: [
          'AUTO-DELIVERY guaranteed at chosen time',
          'Daily verse via WhatsApp (no action needed)',
          'Daily email with beautiful HTML template',
          'Weekend reflection questions',
          'Streak counter & gamification'
        ]
      },
      {
        id: 'premium_monthly',
        name: 'Premium',
        price: PRICING.premium_monthly,
        billingCycle: 'monthly',
        features: [
          'Everything in Basic',
          'Daily audio explanation (60-90 sec)',
          'Chapter-wise deep dives (weekly)',
          'PDF downloads of full chapters',
          'Ad-free experience',
          'Priority support'
        ]
      },
      {
        id: 'premium_yearly',
        name: 'Premium',
        price: PRICING.premium_yearly,
        billingCycle: 'yearly',
        savings: `Save ₹${PRICING.premium_monthly * 12 - PRICING.premium_yearly}`,
        features: [
          'Everything in Basic',
          'Daily audio explanation (60-90 sec)',
          'Chapter-wise deep dives (weekly)',
          'PDF downloads of full chapters',
          'Ad-free experience',
          'Priority support'
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPlans
};
