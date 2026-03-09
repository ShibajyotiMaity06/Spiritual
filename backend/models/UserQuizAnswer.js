// ═══════════════════════════════════════════════════════
// models/UserQuizAnswer.js
// ═══════════════════════════════════════════════════════

const userQuizAnswerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  quizId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true 
  },
  
  answer: { 
    type: String, 
    enum: ['A', 'B', 'C'],
    required: true 
  },
  isCorrect: { type: Boolean, required: true },
  
  timestamp: { type: Date, default: Date.now }
});

userQuizAnswerSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('UserQuizAnswer', userQuizAnswerSchema);