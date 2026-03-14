



const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { PRICING, PLAN_FEATURES } = require('../config/constants');


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




const createOrder = async (req, res, next) => {
  try {
    const { plan, deliveryChannel } = req.body;

    const amount = PRICING[plan];
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }


    const planStatus = getPlanStatus(plan);
    const features = PLAN_FEATURES[planStatus];
    if (deliveryChannel && features && !features.allowedChannels.includes(deliveryChannel)) {
      return res.status(400).json({
        success: false,
        message: `The ${plan} plan does not support ${deliveryChannel} delivery`
      });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `order_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan,
        deliveryChannel: deliveryChannel || 'email',
        email: req.user.email
      }
    });


    await Payment.create({
      userId: req.user._id,
      amount,
      plan,
      razorpayOrderId: order.id,
      status: 'pending',
      metadata: { deliveryChannel: deliveryChannel || 'email' }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};




function getPlanStatus(plan) {
  if (plan.startsWith('basic')) return 'paid_basic';
  if (plan.startsWith('standard')) return 'paid_standard';
  if (plan.startsWith('premium')) return 'paid_premium';
  return 'paid_basic';
}




const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;


    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.
    createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).
    update(body).
    digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed — invalid signature'
      });
    }


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


    const subscriptionStatus = getPlanStatus(payment.plan);
    const isYearly = payment.plan.endsWith('yearly');
    const durationMs = isYearly ?
    365 * 24 * 60 * 60 * 1000 :
    30 * 24 * 60 * 60 * 1000;


    const deliveryChannel = payment.metadata?.deliveryChannel || 'email';
    const features = PLAN_FEATURES[subscriptionStatus];
    const effectiveChannel = features.allowedChannels.includes(deliveryChannel) ?
    deliveryChannel :
    features.allowedChannels[0];


    const user = await User.findByIdAndUpdate(
      payment.userId,
      {
        subscriptionStatus,
        subscriptionPlan: isYearly ? 'yearly' : 'monthly',
        subscriptionStartDate: new Date(),
        subscriptionExpiry: new Date(Date.now() + durationMs),
        deliveryChannel: effectiveChannel,
        razorpayPaymentId: razorpay_payment_id,
        amountPaid: payment.amount
      },
      { new: true }
    ).select('name email subscriptionStatus subscriptionExpiry deliveryChannel');

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
          expiresAt: user.subscriptionExpiry,
          deliveryChannel: user.deliveryChannel
        }
      }
    });
  } catch (error) {
    next(error);
  }
};




const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).
    sort({ createdAt: -1 }).
    lean();

    res.status(200).json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};




const getPlans = async (req, res, next) => {
  try {
    const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: 0,
      billingCycle: null,
      trialDays: 3,
      deliveryChannels: ['email'],
      features: [
      '3-day free trial',
      'Daily verse via Email',
      'Text-only (no audio)',
      'Email delivery only']

    },
    {
      id: 'basic_monthly',
      name: 'Basic',
      price: PRICING.basic_monthly,
      billingCycle: 'monthly',
      deliveryChannels: ['email'],
      features: [
      'Daily verse via Email',
      'Auto-delivery at chosen time',
      'Beautiful HTML email template',
      'Email delivery only',
      'No audio']

    },
    {
      id: 'standard_monthly',
      name: 'Standard',
      price: PRICING.standard_monthly,
      billingCycle: 'monthly',
      deliveryChannels: ['email', 'whatsapp'],
      features: [
      'Choose WhatsApp OR Email delivery',
      'Auto-delivery at chosen time',
      'Daily audio explanation included',
      'Beautiful HTML email or WhatsApp messages',
      'Streak counter & gamification']

    },
    {
      id: 'premium_monthly',
      name: 'Premium',
      price: PRICING.premium_monthly,
      billingCycle: 'monthly',
      deliveryChannels: ['email', 'whatsapp'],
      features: [
      'Everything in Standard',
      'Choose WhatsApp OR Email delivery',
      'Daily audio explanation included',
      'Chapter-wise deep dives (weekly)',
      'PDF downloads of full chapters',
      'Priority support']

    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      price: PRICING.premium_yearly,
      billingCycle: 'yearly',
      deliveryChannels: ['email', 'whatsapp'],
      savings: `Save ₹${PRICING.premium_monthly * 12 - PRICING.premium_yearly}`,
      features: [
      'Everything in Premium Monthly',
      'Choose WhatsApp OR Email delivery',
      'Daily audio explanation included',
      'Chapter-wise deep dives (weekly)',
      'PDF downloads of full chapters',
      'Priority support',
      'Best value — yearly pricing']

    }];


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