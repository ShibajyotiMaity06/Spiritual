// ═══════════════════════════════════════════════════════
// routes/deliveryRoutes.js
// ═══════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const {
  getMyDeliveryLogs,
  triggerDelivery,
  whatsappWebhook,
  updateDeliveryStatus
} = require('../controllers/deliveryController');
const { protect, adminOnly } = require('../middleware/auth');
const { webhookLimiter } = require('../middleware/rateLimiter');

// Protected (user)
router.get('/logs', protect, getMyDeliveryLogs);

// Admin
router.post('/send', protect, adminOnly, triggerDelivery);

// Webhooks (external — no auth, rate-limited)
router.post('/webhook/whatsapp', webhookLimiter, whatsappWebhook);
router.put('/status', webhookLimiter, updateDeliveryStatus);

module.exports = router;
