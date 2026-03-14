



const mongoose = require('mongoose');

const incomingMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  whatsappNumber: { type: String, required: true },

  messageType: {
    type: String,
    enum: ['text', 'image', 'audio', 'video', 'document'],
    default: 'text'
  },
  messageText: String,
  mediaUrl: String,

  intent: {
    type: String,
    enum: ['get_verse', 'quiz_answer', 'reflection', 'support', 'feedback', 'other'],
    default: 'other'
  },


  opensServiceWindow: { type: Boolean, default: true },
  serviceWindowExpiresAt: Date,

  timestamp: { type: Date, default: Date.now }
});


incomingMessageSchema.index({ userId: 1, timestamp: -1 });
incomingMessageSchema.index({ whatsappNumber: 1, timestamp: -1 });


incomingMessageSchema.pre('save', function (next) {
  if (this.opensServiceWindow) {
    this.serviceWindowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('IncomingMessage', incomingMessageSchema);