// ═══════════════════════════════════════════════════════
// routes/quizRoutes.js
// ═══════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getTodayQuiz,
  submitAnswer,
  getMyQuizStats,
  createQuiz,
  deleteQuiz
} = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/auth');

// Protected (user)
router.get('/', protect, getQuizzes);
router.get('/today', protect, getTodayQuiz);
router.get('/my-stats', protect, getMyQuizStats);
router.post('/:id/answer', protect, submitAnswer);

// Admin
router.post('/', protect, adminOnly, createQuiz);
router.delete('/:id', protect, adminOnly, deleteQuiz);

module.exports = router;
