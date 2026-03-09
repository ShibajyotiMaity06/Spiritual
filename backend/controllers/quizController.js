// ═══════════════════════════════════════════════════════
// controllers/quizController.js — Quiz CRUD & Answers
// ═══════════════════════════════════════════════════════

const Quiz = require('../models/Quiz');
const UserQuizAnswer = require('../models/UserQuizAnswer');
const { RELIGIONS, LANGUAGES } = require('../config/constants');

// ─────────────────────────────────────────────────────
// GET /api/quizzes — Get quizzes with filters
// ─────────────────────────────────────────────────────
const getQuizzes = async (req, res, next) => {
  try {
    const { religion, language, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (religion) filter.religion = religion;
    if (language) filter.language = language;

    const skip = (Number(page) - 1) * Number(limit);

    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .populate('verseId', 'chapter verseNumber book')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Quiz.countDocuments(filter)
    ]);

    // Strip correct answer for non-admin users
    const sanitized = quizzes.map(q => ({
      ...q,
      correctAnswer: undefined // Don't leak the answer
    }));

    res.status(200).json({
      success: true,
      data: {
        quizzes: sanitized,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// GET /api/quizzes/today — Get today's quiz for user
// ─────────────────────────────────────────────────────
const getTodayQuiz = async (req, res, next) => {
  try {
    const user = req.user;

    // Find a quiz the user hasn't answered yet
    const answeredQuizIds = await UserQuizAnswer.find({ userId: user._id })
      .distinct('quizId');

    const quiz = await Quiz.findOne({
      religion: user.religion,
      language: user.language,
      isActive: true,
      _id: { $nin: answeredQuizIds }
    })
      .populate('verseId', 'chapter verseNumber book originalText')
      .lean();

    if (!quiz) {
      return res.status(200).json({
        success: true,
        message: 'You have answered all available quizzes! 🎉',
        data: { quiz: null, completed: true }
      });
    }

    // Remove correct answer
    const { correctAnswer, ...safeQuiz } = quiz;

    res.status(200).json({
      success: true,
      data: { quiz: safeQuiz }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// POST /api/quizzes/:id/answer — Submit quiz answer
// ─────────────────────────────────────────────────────
const submitAnswer = async (req, res, next) => {
  try {
    const { answer } = req.body;
    const quizId = req.params.id;

    if (!answer || !['A', 'B', 'C'].includes(answer.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Answer must be A, B, or C'
      });
    }

    // Check if already answered
    const existing = await UserQuizAnswer.findOne({
      userId: req.user._id,
      quizId
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already answered this quiz'
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const isCorrect = answer.toUpperCase() === quiz.correctAnswer;

    // Save answer
    const userAnswer = await UserQuizAnswer.create({
      userId: req.user._id,
      quizId,
      answer: answer.toUpperCase(),
      isCorrect
    });

    // Update quiz stats
    await Quiz.findByIdAndUpdate(quizId, {
      $inc: {
        totalAttempts: 1,
        ...(isCorrect ? { correctAttempts: 1 } : {})
      }
    });

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
        yourAnswer: answer.toUpperCase()
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// GET /api/quizzes/my-stats — Quiz stats for user
// ─────────────────────────────────────────────────────
const getMyQuizStats = async (req, res, next) => {
  try {
    const answers = await UserQuizAnswer.find({ userId: req.user._id }).lean();

    const totalAnswered = answers.length;
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const accuracy = totalAnswered > 0
      ? Math.round((totalCorrect / totalAnswered) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalAnswered,
          totalCorrect,
          totalWrong: totalAnswered - totalCorrect,
          accuracy: `${accuracy}%`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// POST /api/quizzes — Create quiz (Admin)
// ─────────────────────────────────────────────────────
const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// DELETE /api/quizzes/:id — Delete quiz (Admin)
// ─────────────────────────────────────────────────────
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Also remove answers for this quiz
    await UserQuizAnswer.deleteMany({ quizId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Quiz and related answers deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getTodayQuiz,
  submitAnswer,
  getMyQuizStats,
  createQuiz,
  deleteQuiz
};
