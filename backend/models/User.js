



const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  whatsappNumber: { type: String, default: undefined, sparse: true },


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
    default: 6,
    min: 5,
    max: 22
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },


  deliveryChannel: {
    type: String,
    enum: ['email', 'whatsapp'],
    default: 'email'
  },


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


  trialStartDate: { type: Date, default: null },
  trialExpiry: { type: Date, default: null },


  razorpayPaymentId: { type: String, default: null },
  razorpaySubscriptionId: { type: String, default: null },
  amountPaid: { type: Number, default: 0 },


  currentVerseIndex: { type: Number, default: 0 },
  lastVerseDeliveredAt: { type: Date, default: null },


  streakCount: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalVersesReceived: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: Date.now },


  isActive: { type: Boolean, default: true },
  isWhatsappOptedIn: { type: Boolean, default: false },
  isEmailOptedIn: { type: Boolean, default: true },


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


userSchema.index({ subscriptionStatus: 1 });
userSchema.index({ religion: 1, language: 1 });


userSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('User', userSchema);