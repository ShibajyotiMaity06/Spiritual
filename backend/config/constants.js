



module.exports = {

  PLANS: {
    FREE: 'free',
    TRIAL: 'trial',
    PAID_BASIC: 'paid_basic',
    PAID_STANDARD: 'paid_standard',
    PAID_PREMIUM: 'paid_premium',
    EXPIRED: 'expired'
  },


  PRICING: {
    basic_monthly: 49,
    standard_monthly: 99,
    premium_monthly: 149,
    premium_yearly: 1599
  },


  PLAN_FEATURES: {
    free: { allowedChannels: ['email'], audio: false, trialDays: 3 },
    trial: { allowedChannels: ['email'], audio: false, trialDays: 3 },
    paid_basic: { allowedChannels: ['email'], audio: false },
    paid_standard: { allowedChannels: ['email', 'whatsapp'], audio: true },
    paid_premium: { allowedChannels: ['email', 'whatsapp'], audio: true },
    expired: { allowedChannels: [], audio: false }
  },


  RELIGIONS: ['hindu', 'muslim', 'christian'],


  LANGUAGES: ['hindi', 'english', 'tamil', 'telugu', 'malayalam', 'kannada', 'urdu'],


  BOOKS: {
    hindu: ['bhagavad_gita'],
    muslim: ['quran'],
    christian: ['new_testament', 'old_testament']
  },


  DELIVERY_METHODS: {
    WHATSAPP: 'whatsapp',
    EMAIL: 'email'
  },


  SERVICE_WINDOW_MS: 24 * 60 * 60 * 1000,


  SIGNUP_SOURCES: ['organic', 'whatsapp_group', 'instagram', 'facebook', 'google_ads']
};