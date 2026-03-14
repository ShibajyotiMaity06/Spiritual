



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


router.get('/logs', protect, getMyDeliveryLogs);


router.post('/send', protect, adminOnly, triggerDelivery);


router.post('/webhook/whatsapp', webhookLimiter, whatsappWebhook);
router.put('/status', webhookLimiter, updateDeliveryStatus);

module.exports = router;