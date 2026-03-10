// ═══════════════════════════════════════════════════════
// routes/subscribeRoutes.js — Public subscription endpoint
// ═══════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/subscribeController');
const { authLimiter } = require('../middleware/rateLimiter');

// Public — no auth required
router.post('/', authLimiter, subscribe);

module.exports = router;
