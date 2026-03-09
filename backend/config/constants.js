// ═══════════════════════════════════════════════════════
// config/constants.js — App-wide constants
// ═══════════════════════════════════════════════════════

module.exports = {
  // Subscription Plans
  PLANS: {
    FREE: 'free',
    TRIAL: 'trial',
    PAID_BASIC: 'paid_basic',
    PAID_PREMIUM: 'paid_premium',
    EXPIRED: 'expired'
  },

  // Pricing (INR)
  PRICING: {
    basic_monthly: 49,
    basic_yearly: 499,
    premium_monthly: 149,
    premium_yearly: 1499
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
    WHATSAPP_TEMPLATE: 'whatsapp_template',
    WHATSAPP_FREEFORM: 'whatsapp_freeform',
    EMAIL: 'email'
  },

  // Service window duration (24 hours in ms)
  SERVICE_WINDOW_MS: 24 * 60 * 60 * 1000,

  // Signup sources
  SIGNUP_SOURCES: ['organic', 'whatsapp_group', 'instagram', 'facebook', 'google_ads']
};
