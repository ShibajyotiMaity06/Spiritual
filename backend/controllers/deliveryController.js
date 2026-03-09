// ═══════════════════════════════════════════════════════
// controllers/deliveryController.js — Delivery Log & Management
// ═══════════════════════════════════════════════════════

const DeliveryLog = require('../models/DeliveryLog');
const User = require('../models/User');
const Verse = require('../models/Verse');
const IncomingMessage = require('../models/IncomingMessage');

// ─────────────────────────────────────────────────────
// GET /api/delivery/logs — Get delivery logs for user
// ─────────────────────────────────────────────────────
const getMyDeliveryLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      DeliveryLog.find({ userId: req.user._id })
        .populate('verseId', 'chapter verseNumber book religion')
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

    // Get next verse for user
    const verse = await Verse.findOne({ religion: user.religion })
      .sort({ chapter: 1, verseNumber: 1 })
      .skip(user.currentVerseIndex);

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'No more verses available. User has completed all verses.'
      });
    }

    // Determine delivery cost
    let cost = 0;
    if (deliveryMethod === 'whatsapp_template') cost = 0.50; // ~₹0.50 per template
    if (deliveryMethod === 'whatsapp_freeform') cost = 0; // Free within service window
    if (deliveryMethod === 'email') cost = 0.01; // Negligible

    // Create delivery log
    const log = await DeliveryLog.create({
      userId: user._id,
      verseId: verse._id,
      deliveryMethod: deliveryMethod || 'email',
      status: 'sent',
      cost,
      timestamp: new Date()
    });

    // Update user progress
    await User.findByIdAndUpdate(userId, {
      $inc: { currentVerseIndex: 1, totalVersesReceived: 1, streakCount: 1 },
      lastVerseDeliveredAt: new Date(),
      lastActivityAt: new Date()
    });

    // Update verse stats
    await Verse.findByIdAndUpdate(verse._id, {
      $inc: { deliveredCount: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Verse delivery triggered successfully',
      data: {
        delivery: log,
        verse: {
          id: verse._id,
          chapter: verse.chapter,
          verseNumber: verse.verseNumber
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// POST /api/delivery/webhook — WhatsApp incoming message
// (Called by WhatsApp Business API provider)
// ─────────────────────────────────────────────────────
const whatsappWebhook = async (req, res, next) => {
  try {
    const { from, text, messageType, mediaUrl } = req.body;

    // Find user by WhatsApp number
    const user = await User.findOne({ whatsappNumber: from });
    if (!user) {
      // Unknown number — could be a new lead
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

    // Save incoming message (opens 24hr service window)
    const message = await IncomingMessage.create({
      userId: user._id,
      whatsappNumber: from,
      messageType: messageType || 'text',
      messageText: text,
      mediaUrl,
      intent,
      opensServiceWindow: true
    });

    // Update user last activity and streak
    await User.findByIdAndUpdate(user._id, {
      lastActivityAt: new Date(),
      isWhatsappOptedIn: true
    });

    // If intent is get_verse and user is on free plan,
    // this opens the service window — trigger freeform delivery
    let verseDelivered = false;
    if (intent === 'get_verse' && user.subscriptionStatus === 'free') {
      // Here you'd integrate with WhatsApp API to send the verse
      // For now, we just log the delivery as freeform (₹0 cost)
      const verse = await Verse.findOne({ religion: user.religion })
        .sort({ chapter: 1, verseNumber: 1 })
        .skip(user.currentVerseIndex);

      if (verse) {
        await DeliveryLog.create({
          userId: user._id,
          verseId: verse._id,
          deliveryMethod: 'whatsapp_freeform',
          status: 'sent',
          cost: 0
        });

        await User.findByIdAndUpdate(user._id, {
          $inc: { currentVerseIndex: 1, totalVersesReceived: 1, streakCount: 1 },
          lastVerseDeliveredAt: new Date()
        });

        verseDelivered = true;
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
// (Callback from WhatsApp/Email provider)
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
