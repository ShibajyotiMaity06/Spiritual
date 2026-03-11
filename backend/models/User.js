// ═══════════════════════════════════════════════════════
// models/User.js
// ═══════════════════════════════════════════════════════

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  whatsappNumber: { type: String, default: undefined, sparse: true },

  // Religion & Preferences
  religion: {
    type: String,
    enum: ['hindu', 'muslim', 'christian'],
    required: true
  },
  book: {
    type: String,
    enum: ['bhagavad_gita', 'quran', 'bible'],
    default: 'bhagavad_gita'
  },
  language: {
    type: String,
    enum: ['hindi', 'english', 'tamil', 'telugu', 'malayalam', 'kannada', 'urdu', 'bengali'],
    required: true
  },
  preferredTime: {
    type: Number,
    default: 6, // 6 AM
    min: 5,
    max: 22
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },

  // Delivery channel preference (user chooses one)
  deliveryChannel: {
    type: String,
    enum: ['email', 'whatsapp'],
    default: 'email'
  },

  // Subscription
  subscriptionStatus: {
    type: String,
    enum: ['free', 'trial', 'paid_basic', 'paid_standard', 'paid_premium', 'expired'],
    default: 'trial'
  },
  subscriptionPlan: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: null
  },
  subscriptionStartDate: { type: Date, default: null },
  subscriptionExpiry: { type: Date, default: null },

  // Trial
  trialStartDate: { type: Date, default: null },
  trialExpiry: { type: Date, default: null },

  // Payment
  razorpayPaymentId: { type: String, default: null },
  razorpaySubscriptionId: { type: String, default: null },
  amountPaid: { type: Number, default: 0 },

  // Content Progress
  currentVerseIndex: { type: Number, default: 0 },
  lastVerseDeliveredAt: { type: Date, default: null },

  // Engagement
  streakCount: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalVersesReceived: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: Date.now },

  // Status
  isActive: { type: Boolean, default: true },
  isWhatsappOptedIn: { type: Boolean, default: false },
  isEmailOptedIn: { type: Boolean, default: true },

  // Metadata
  signupSource: {
    type: String,
    enum: ['organic', 'whatsapp_group', 'instagram', 'facebook', 'google_ads'],
    default: 'organic'
  },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance (email & whatsappNumber already indexed via unique/sparse in schema)
userSchema.index({ subscriptionStatus: 1 });
userSchema.index({ religion: 1, language: 1 });

// Pre-save hook
userSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('User', userSchema);