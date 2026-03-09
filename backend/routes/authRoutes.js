// ═══════════════════════════════════════════════════════
// routes/authRoutes.js
// ═══════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Public
router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, login);

// Protected
router.get('/me', protect, getMe);

module.exports = router;
