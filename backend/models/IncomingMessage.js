// ═══════════════════════════════════════════════════════
// models/IncomingMessage.js
// ═══════════════════════════════════════════════════════

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
  
  // This opens 24hr service window
  opensServiceWindow: { type: Boolean, default: true },
  serviceWindowExpiresAt: Date,
  
  timestamp: { type: Date, default: Date.now }
});

// Indexes
incomingMessageSchema.index({ userId: 1, timestamp: -1 });
incomingMessageSchema.index({ whatsappNumber: 1, timestamp: -1 });

// Pre-save hook to set service window expiry
incomingMessageSchema.pre('save', function(next) {
  if (this.opensServiceWindow) {
    this.serviceWindowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours
  }
  next();
});

module.exports = mongoose.model('IncomingMessage', incomingMessageSchema);