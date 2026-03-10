// ═══════════════════════════════════════════════════════
// config/constants.js — App-wide constants
// ═══════════════════════════════════════════════════════

module.exports = {
  // Subscription Plans
  PLANS: {
    FREE: 'free',
    TRIAL: 'trial',
    PAID_BASIC: 'paid_basic',
    PAID_STANDARD: 'paid_standard',
    PAID_PREMIUM: 'paid_premium',
    EXPIRED: 'expired'
  },

  // Pricing (INR)
  PRICING: {
    basic_monthly: 49,
    standard_monthly: 99,
    premium_monthly: 149,
    premium_yearly: 1599
  },

  // Plan features mapping
  PLAN_FEATURES: {
    free: { allowedChannels: ['email'], audio: false, trialDays: 3 },
    trial: { allowedChannels: ['email'], audio: false, trialDays: 3 },
    paid_basic: { allowedChannels: ['email'], audio: false },
    paid_standard: { allowedChannels: ['email', 'whatsapp'], audio: true },
    paid_premium: { allowedChannels: ['email', 'whatsapp'], audio: true },
    expired: { allowedChannels: [], audio: false }
  },

  // Religions
  RELIGIONS: ['hindu', 'muslim', 'christian'],

  // Languages
  LANGUAGES: ['hindi', 'english', 'tamil', 'telugu', 'malayalam', 'kannada', 'urdu'],

  // Books per religion
  BOOKS: {
    hindu: ['bhagavad_gita'],
    muslim: ['quran'],
    christian: ['new_testament', 'old_testament']
  },

  // Delivery methods
  DELIVERY_METHODS: {
    WHATSAPP: 'whatsapp',
    EMAIL: 'email'
  },

  // Service window duration (24 hours in ms)
  SERVICE_WINDOW_MS: 24 * 60 * 60 * 1000,

  // Signup sources
  SIGNUP_SOURCES: ['organic', 'whatsapp_group', 'instagram', 'facebook', 'google_ads']
};
