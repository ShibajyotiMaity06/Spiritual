// ═══════════════════════════════════════════════════════
// controllers/deliveryController.js — Delivery Log & Management
// ═══════════════════════════════════════════════════════

const DeliveryLog = require('../models/DeliveryLog');
const User = require('../models/User');
const IncomingMessage = require('../models/IncomingMessage');
const { PLAN_FEATURES } = require('../config/constants');
const { formatWhatsAppMessage, formatEmailHTML, formatEmailSubject } = require('../services/messageFormatter');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { sendVerseEmail } = require('../services/emailService');
const { getVerseByIndex, deliverVerseOnDemand, getEffectiveChannel } = require('../services/schedulerService');

// ─────────────────────────────────────────────────────
// GET /api/delivery/logs — Get delivery logs for user
// ─────────────────────────────────────────────────────
const getMyDeliveryLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      DeliveryLog.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      DeliveryLog.countDocuments({ userId: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
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
// POST /api/delivery/send — Manually trigger verse delivery
// (Admin or cron-triggered)
// ─────────────────────────────────────────────────────
const triggerDelivery = async (req, res, next) => {
  try {
    const { userId, deliveryMethod } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get next verse from JSON dataset
    const verse = getVerseByIndex(user.currentVerseIndex);
    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'No more verses available. User has completed all verses.'
      });
    }

    const results = { whatsapp: null, email: null };

    // Use effective channel based on plan, or override with deliveryMethod if specified
    const channel = deliveryMethod || getEffectiveChannel(user) || 'email';

    // ── Send via WhatsApp ──
    if ((channel === 'whatsapp' || channel === 'whatsapp_template' || channel === 'whatsapp_freeform') && user.whatsappNumber) {
      const whatsappText = formatWhatsAppMessage(verse, user);
      const waResult = await sendWhatsAppMessage(user.whatsappNumber, whatsappText);
      results.whatsapp = waResult;

      await DeliveryLog.create({
        userId: user._id,
        verseId: null,
        deliveryMethod: 'whatsapp_freeform',
        status: waResult.success ? 'sent' : 'failed',
        cost: 0,
        whatsappMessageId: waResult.messageId || null,
        timestamp: new Date()
      });
    }

    // ── Send via Email ──
    if (channel === 'email' || (!results.whatsapp)) {
      const subject = formatEmailSubject(verse);
      const html = formatEmailHTML(verse, user);
      const emailResult = await sendVerseEmail(user.email, subject, html);
      results.email = emailResult;

      await DeliveryLog.create({
        userId: user._id,
        verseId: null,
        deliveryMethod: 'email',
        status: emailResult.success ? 'sent' : 'failed',
        cost: 0.01,
        emailMessageId: emailResult.messageId || null,
        timestamp: new Date()
      });
    }

    // Update user progress
    await User.findByIdAndUpdate(userId, {
      $inc: { currentVerseIndex: 1, totalVersesReceived: 1, streakCount: 1 },
      lastVerseDeliveredAt: new Date(),
      lastActivityAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Verse delivery triggered successfully',
      data: {
        verse: {
          chapter: verse.chapter,
          verse: verse.verse,
          id: verse.id
        },
        channel,
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// POST /api/delivery/webhook — WhatsApp incoming message
// (Called by Twilio webhook for incoming WhatsApp messages)
// ─────────────────────────────────────────────────────
const whatsappWebhook = async (req, res, next) => {
  try {
    // Twilio sends different field names than Meta
    const from = req.body.From || req.body.from || '';
    const text = req.body.Body || req.body.text || '';
    const messageType = req.body.MessageType || req.body.messageType || 'text';
    const mediaUrl = req.body.MediaUrl0 || req.body.mediaUrl || null;

    // Strip 'whatsapp:+' prefix from Twilio format
    const phoneNumber = from.replace('whatsapp:', '').replace('+', '');

    // Find user by WhatsApp number (try with and without country code)
    let user = await User.findOne({ whatsappNumber: phoneNumber });
    if (!user) {
      // Try without country code (strip 91 prefix for Indian numbers)
      const shortNumber = phoneNumber.startsWith('91') ? phoneNumber.slice(2) : phoneNumber;
      user = await User.findOne({ whatsappNumber: shortNumber });
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Message received from unknown number'
      });
    }

    // Determine intent
    let intent = 'other';
    const lowerText = (text || '').toLowerCase().trim();

    if (['✅', 'yes', 'confirm', 'hi', 'hello', 'verse', 'gita', 'quran', 'bible'].some(k => lowerText.includes(k))) {
      intent = 'get_verse';
    } else if (['quiz', 'answer', 'a', 'b', 'c'].includes(lowerText)) {
      intent = 'quiz_answer';
    } else if (['help', 'support', 'issue', 'problem'].some(k => lowerText.includes(k))) {
      intent = 'support';
    } else if (['feedback', 'suggest', 'review'].some(k => lowerText.includes(k))) {
      intent = 'feedback';
    }

    // Save incoming message
    const message = await IncomingMessage.create({
      userId: user._id,
      whatsappNumber: phoneNumber,
      messageType,
      messageText: text,
      mediaUrl,
      intent,
      opensServiceWindow: true
    });

    // Update user last activity
    await User.findByIdAndUpdate(user._id, {
      lastActivityAt: new Date(),
      isWhatsappOptedIn: true
    });

    // If intent is get_verse → send verse via WhatsApp
    let verseDelivered = false;
    if (intent === 'get_verse') {
      // Check if user's plan allows WhatsApp delivery
      const features = PLAN_FEATURES[user.subscriptionStatus];
      const canUseWhatsApp = features && features.allowedChannels.includes('whatsapp');

      if (canUseWhatsApp) {
        const verse = getVerseByIndex(user.currentVerseIndex);

        if (verse) {
          const whatsappText = formatWhatsAppMessage(verse, user);
          const waResult = await sendWhatsAppMessage(user.whatsappNumber || phoneNumber, whatsappText);

          await DeliveryLog.create({
            userId: user._id,
            verseId: null,
            deliveryMethod: 'whatsapp_freeform',
            status: waResult.success ? 'sent' : 'failed',
            cost: 0,
            whatsappMessageId: waResult.messageId || null,
            timestamp: new Date()
          });

          await User.findByIdAndUpdate(user._id, {
            $inc: { currentVerseIndex: 1, totalVersesReceived: 1, streakCount: 1 },
            lastVerseDeliveredAt: new Date()
          });

          verseDelivered = waResult.success;
        }
      } else {
        // User's plan doesn't support WhatsApp — send a message informing them
        const { sendWhatsAppMessage: sendWA } = require('../services/whatsappService');
        await sendWA(
          user.whatsappNumber || phoneNumber,
          '🙏 Your current plan supports email delivery only. Please upgrade to the Standard (₹99/mo) or higher plan to receive verses via WhatsApp.\n\nVisit dailyfaith.in to upgrade!'
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed',
      data: {
        intent,
        serviceWindowOpened: true,
        serviceWindowExpiresAt: message.serviceWindowExpiresAt,
        verseDelivered
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// PUT /api/delivery/status — Update delivery status
// (Callback from Twilio/Resend status webhook)
// ─────────────────────────────────────────────────────
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { messageId, status, deliveredAt, readAt } = req.body;

    const update = { status };
    if (deliveredAt) update.deliveredAt = new Date(deliveredAt);
    if (readAt) update.readAt = new Date(readAt);

    const log = await DeliveryLog.findOneAndUpdate(
      {
        $or: [
          { whatsappMessageId: messageId },
          { emailMessageId: messageId }
        ]
      },
      { $set: update },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Delivery log not found for this message ID'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Delivery status updated',
      data: { log }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyDeliveryLogs,
  triggerDelivery,
  whatsappWebhook,
  updateDeliveryStatus
};
