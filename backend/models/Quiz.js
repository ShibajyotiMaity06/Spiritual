// -------------------------------------------------------
// models/Quiz.js
// -------------------------------------------------------

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  verseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verse',
    required: true
  },
  religion: {
    type: String,
    enum: ['hindu', 'muslim', 'christian'],
    required: true
  },
  language: {
    type: String,
    enum: ['hindi', 'english', 'tamil', 'telugu', 'malayalam', 'kannada', 'urdu'],
    required: true
  },

  question: { type: String, required: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true }
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: true
  },
  explanation: { type: String },

  totalAttempts: { type: Number, default: 0 },
  correctAttempts: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

quizSchema.index({ verseId: 1 });
quizSchema.index({ religion: 1, language: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
