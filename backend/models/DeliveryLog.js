



const mongoose = require('mongoose');

const deliveryLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verse',
    default: null
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

  cost: { type: Number, default: 0 },


  whatsappMessageId: String,
  whatsappStatus: String,


  emailMessageId: String,
  emailOpened: { type: Boolean, default: false },
  emailClicked: { type: Boolean, default: false },

  timestamp: { type: Date, default: Date.now },
  deliveredAt: Date,
  readAt: Date
});


deliveryLogSchema.index({ userId: 1, timestamp: -1 });
deliveryLogSchema.index({ deliveryMethod: 1, timestamp: -1 });

module.exports = mongoose.model('DeliveryLog', deliveryLogSchema);