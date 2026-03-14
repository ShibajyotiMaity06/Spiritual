const express = require('express');
const router = express.Router();
const { createReflection } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/reflection', authLimiter, optionalAuth, createReflection);

module.exports = router;
