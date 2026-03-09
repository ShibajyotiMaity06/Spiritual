// ═══════════════════════════════════════════════════════
// models/DeliveryLog.js
// ═══════════════════════════════════════════════════════

const deliveryLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  verseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Verse', 
    required: true 
  },
  
  deliveryMethod: { 
    type: String, 
    enum: ['whatsapp_template', 'whatsapp_freeform', 'email'],
    required: true 
  },
  
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  cost: { type: Number, default: 0 }, // In INR
  
  // WhatsApp specific
  whatsappMessageId: String,
  whatsappStatus: String,
  
  // Email specific
  emailMessageId: String,
  emailOpened: { type: Boolean, default: false },
  emailClicked: { type: Boolean, default: false },
  
  timestamp: { type: Date, default: Date.now },
  deliveredAt: Date,
  readAt: Date
});

// Indexes
deliveryLogSchema.index({ userId: 1, timestamp: -1 });
deliveryLogSchema.index({ deliveryMethod: 1, timestamp: -1 });

module.exports = mongoose.model('DeliveryLog', deliveryLogSchema);