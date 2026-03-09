// ═══════════════════════════════════════════════════════
// models/Analytics.js (Daily aggregate stats)
// ═══════════════════════════════════════════════════════

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  
  users: {
    total: Number,
    free: Number,
    trial: Number,
    paid_basic: Number,
    paid_premium: Number,
    newSignups: Number,
    churned: Number
  },
  
  delivery: {
    whatsappTemplatesSent: Number,
    whatsappFreeformSent: Number,
    emailsSent: Number,
    totalCost: Number // In INR
  },
  
  engagement: {
    incomingMessages: Number,
    quizResponses: Number,
    averageStreakDays: Number
  },
  
  revenue: {
    totalRevenue: Number,
    basicRevenue: Number,
    premiumRevenue: Number,
    newSubscriptions: Number,
    renewals: Number,
    refunds: Number
  }
});

analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);