// ═══════════════════════════════════════════════════════
// models/Payment.js
// ═══════════════════════════════════════════════════════

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  amount: { type: Number, required: true }, // In INR
  currency: { type: String, default: 'INR' },
  
  plan: { 
    type: String, 
    enum: ['basic_monthly', 'basic_yearly', 'premium_monthly', 'premium_yearly'],
    required: true 
  },
  
  // Razorpay
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  
  paymentMethod: String, // 'upi', 'card', 'netbanking', etc.
  
  metadata: mongoose.Schema.Types.Mixed,
  
  createdAt: { type: Date, default: Date.now },
  paidAt: Date
});

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ razorpayPaymentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);