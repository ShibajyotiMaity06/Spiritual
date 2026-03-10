// ═══════════════════════════════════════════════════════
// services/schedulerService.js — Cron-based Auto-Delivery
// ═══════════════════════════════════════════════════════

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const DeliveryLog = require('../models/DeliveryLog');
const { PLAN_FEATURES } = require('../config/constants');
const {
    formatWhatsAppMessage, formatEmailHTML, formatEmailSubject,
    formatQuranWhatsAppMessage, formatQuranEmailHTML, formatQuranEmailSubject,
    userGetsAudio, getAudioUrl
} = require('./messageFormatter');
const { sendWhatsAppMessage, sendWhatsAppAudio } = require('./whatsappService');
const { sendVerseEmail } = require('./emailService');

// ─────────────────────────────────────────────────────
// Load Gita dataset from JSON
// ─────────────────────────────────────────────────────
let gitaDataset = null;

function loadDataset() {
    if (gitaDataset) return gitaDataset;

    const dataPath = path.join(__dirname, '..', '..', 'gita_dataset_v3.json');
    try {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        gitaDataset = JSON.parse(raw);
        console.log(`📖 Loaded Gita dataset: ${gitaDataset.length} verses`);
        return gitaDataset;
    } catch (error) {
        console.error('❌ Failed to load Gita dataset:', error.message);
        return [];
    }
}

// ─────────────────────────────────────────────────────
// Load Quran dataset from JSON
// ─────────────────────────────────────────────────────
let quranDataset = null;

function loadQuranDataset() {
    if (quranDataset) return quranDataset;

    const dataPath = path.join(__dirname, '..', '..', 'quran-verses.json');
    try {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        quranDataset = JSON.parse(raw);
        console.log(`📖 Loaded Quran dataset: ${quranDataset.length} verses`);
        return quranDataset;
    } catch (error) {
        console.error('❌ Failed to load Quran dataset:', error.message);
        return [];
    }
}

// ─────────────────────────────────────────────────────
// Get verse by index from Gita dataset
// ─────────────────────────────────────────────────────
function getVerseByIndex(index) {
    const dataset = loadDataset();
    if (dataset.length === 0) return null;
    return dataset[index % dataset.length];
}

// ─────────────────────────────────────────────────────
// Get Quran verse pair by currentVerseIndex
// Quran sends 2 verses per day. If the last verse of a
// surah is odd (no pair), send just 1, then continue
// next surah with a fresh pair.
//
// currentVerseIndex = position in the flat quran array.
// Returns: { verses: [v1, v2] or [v1], advanceBy: 2 or 1 }
// ─────────────────────────────────────────────────────
function getQuranVersesByIndex(index) {
    const dataset = loadQuranDataset();
    if (dataset.length === 0) return null;

    const idx = index % dataset.length;
    const first = dataset[idx];
    if (!first) return null;

    // Check if there's a second verse
    const second = dataset[idx + 1] || null;

    // If second verse exists and is in the same surah → send pair
    if (second && second.surah === first.surah) {
        return { verses: [first, second], advanceBy: 2 };
    }

    // First is the last verse of its surah (or no more data) → send solo
    // Next call will start fresh from the next surah
    return { verses: [first], advanceBy: 1 };
}

// ─────────────────────────────────────────────────────
// Get the effective delivery channel for a user
// Based on their plan and preference
// ─────────────────────────────────────────────────────
function getEffectiveChannel(user) {
    const features = PLAN_FEATURES[user.subscriptionStatus];
    if (!features || features.allowedChannels.length === 0) {
        return null; // expired or unknown plan
    }

    const preferred = user.deliveryChannel || 'email';

    // If user's preferred channel is allowed by their plan, use it
    if (features.allowedChannels.includes(preferred)) {
        return preferred;
    }

    // Fallback to first allowed channel (email for basic/free/trial)
    return features.allowedChannels[0];
}

// ─────────────────────────────────────────────────────
// Deliver verse to a single user
// ─────────────────────────────────────────────────────
async function deliverVerseToUser(user) {
    try {
        const userBook = user.book || 'bhagavad_gita';
        const isQuran = userBook === 'quran';

        // Get verse(s) based on book
        let verse, quranPair, advanceBy = 1;

        if (isQuran) {
            quranPair = getQuranVersesByIndex(user.currentVerseIndex);
            if (!quranPair) {
                console.log(`⚠️ No Quran verse found for user ${user.email} at index ${user.currentVerseIndex}`);
                return;
            }
            advanceBy = quranPair.advanceBy;
        } else {
            verse = getVerseByIndex(user.currentVerseIndex);
            if (!verse) {
                console.log(`⚠️ No verse found for user ${user.email} at index ${user.currentVerseIndex}`);
                return;
            }
        }

        const channel = getEffectiveChannel(user);
        if (!channel) {
            console.log(`⚠️ No delivery channel for user ${user.email} (status: ${user.subscriptionStatus})`);
            return;
        }

        const results = { whatsapp: null, email: null };
        const includeAudio = userGetsAudio(user);

        // ── Send via the user's effective delivery channel ──
        if (channel === 'whatsapp' && user.whatsappNumber) {
            let whatsappText;
            if (isQuran) {
                whatsappText = formatQuranWhatsAppMessage(quranPair.verses, user);
            } else {
                whatsappText = formatWhatsAppMessage(verse, user);
            }
            results.whatsapp = await sendWhatsAppMessage(user.whatsappNumber, whatsappText);

            // Log WhatsApp delivery
            await DeliveryLog.create({
                userId: user._id,
                verseId: null,
                deliveryMethod: 'whatsapp_freeform',
                status: results.whatsapp.success ? 'sent' : 'failed',
                cost: 0,
                whatsappMessageId: results.whatsapp.messageId || null,
                timestamp: new Date()
            });

            // Send audio separately if eligible
            if (includeAudio && !isQuran) {
                const audioUrl = getAudioUrl(verse.id, user.language);
                await sendWhatsAppAudio(user.whatsappNumber, audioUrl);
            }
            // Quran audio is embedded in the message/email via external URL
        } else {
            // Send email
            let subject, html;
            if (isQuran) {
                subject = formatQuranEmailSubject(quranPair.verses);
                html = formatQuranEmailHTML(quranPair.verses, user);
            } else {
                subject = formatEmailSubject(verse);
                html = formatEmailHTML(verse, user);
            }
            results.email = await sendVerseEmail(user.email, subject, html);

            // Log email delivery
            await DeliveryLog.create({
                userId: user._id,
                verseId: null,
                deliveryMethod: 'email',
                status: results.email.success ? 'sent' : 'failed',
                cost: 0.01,
                emailMessageId: results.email.messageId || null,
                timestamp: new Date()
            });
        }

        // ── Update user progress ──
        const updateQuery = {
            $inc: { currentVerseIndex: advanceBy, totalVersesReceived: advanceBy, streakCount: 1 },
            lastVerseDeliveredAt: new Date(),
            lastActivityAt: new Date()
        };

        // Update longest streak if current streak exceeds it
        if (user.streakCount + 1 > user.longestStreak) {
            updateQuery.longestStreak = user.streakCount + 1;
        }

        await User.findByIdAndUpdate(user._id, updateQuery);

        if (isQuran) {
            const vIds = quranPair.verses.map(v => `${v.surah}:${v.verse}`).join(', ');
            console.log(
                `📨 Delivered Quran ${vIds} to ${user.name} ` +
                `via ${channel.toUpperCase()} ` +
                `(${channel === 'whatsapp' ? (results.whatsapp?.success ? '✅' : '❌') : (results.email?.success ? '✅' : '❌')})`
            );
        } else {
            console.log(
                `📨 Delivered Ch.${verse.chapter}:${verse.verse} to ${user.name} ` +
                `via ${channel.toUpperCase()} ` +
                `(${channel === 'whatsapp' ? (results.whatsapp?.success ? '✅' : '❌') : (results.email?.success ? '✅' : '❌')})`
            );
        }

        return results;
    } catch (error) {
        console.error(`❌ Delivery failed for user ${user.email}:`, error.message);
    }
}

// ─────────────────────────────────────────────────────
// Expire trial users whose trial has ended
// ─────────────────────────────────────────────────────
async function expireTrials() {
    try {
        const result = await User.updateMany(
            {
                subscriptionStatus: 'trial',
                trialExpiry: { $lt: new Date() }
            },
            {
                $set: { subscriptionStatus: 'expired' }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`⏰ Expired ${result.modifiedCount} trial user(s)`);
        }
    } catch (error) {
        console.error('❌ Trial expiry check failed:', error.message);
    }
}

// ─────────────────────────────────────────────────────
// Expire paid subscriptions that have passed their expiry
// ─────────────────────────────────────────────────────
async function expireSubscriptions() {
    try {
        const result = await User.updateMany(
            {
                subscriptionStatus: { $in: ['paid_basic', 'paid_standard', 'paid_premium'] },
                subscriptionExpiry: { $lt: new Date() }
            },
            {
                $set: { subscriptionStatus: 'expired' }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`⏰ Expired ${result.modifiedCount} paid subscription(s)`);
        }
    } catch (error) {
        console.error('❌ Subscription expiry check failed:', error.message);
    }
}

// ─────────────────────────────────────────────────────
// Process all users scheduled for the current hour
// ─────────────────────────────────────────────────────
async function processScheduledDeliveries() {
    try {
        // First, expire any trials and subscriptions that have ended
        await expireTrials();
        await expireSubscriptions();

        // Get current IST hour
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const istTime = new Date(now.getTime() + istOffset);
        const currentHour = istTime.getUTCHours();

        console.log(`\n⏰ Running scheduled delivery check at IST hour: ${currentHour}:00`);

        // Find all active users whose preferred time matches current hour
        // Include: trial (with valid expiry), paid_basic, paid_standard, paid_premium
        const users = await User.find({
            isActive: true,
            preferredTime: currentHour,
            subscriptionStatus: { $in: ['trial', 'paid_basic', 'paid_standard', 'paid_premium'] },
            // Don't deliver if subscription/trial has expired
            $or: [
                // Trial users with valid trial
                { subscriptionStatus: 'trial', trialExpiry: { $gt: new Date() } },
                // Paid users with no expiry set or valid expiry
                {
                    subscriptionStatus: { $in: ['paid_basic', 'paid_standard', 'paid_premium'] },
                    $or: [
                        { subscriptionExpiry: null },
                        { subscriptionExpiry: { $gt: new Date() } }
                    ]
                }
            ]
        });

        if (users.length === 0) {
            console.log('📭 No users scheduled for delivery at this hour.');
            return;
        }

        console.log(`📬 Found ${users.length} users scheduled for hour ${currentHour}`);

        // Process deliveries in batches of 10
        const BATCH_SIZE = 10;
        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(user => deliverVerseToUser(user)));

            // Small delay between batches
            if (i + BATCH_SIZE < users.length) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        console.log(`✅ Scheduled delivery complete. Processed ${users.length} users.\n`);
    } catch (error) {
        console.error('❌ Scheduled delivery error:', error.message);
    }
}

// ─────────────────────────────────────────────────────
// Deliver verse to a specific user (on-demand)
// Used by webhook for free users and admin trigger
// ─────────────────────────────────────────────────────
async function deliverVerseOnDemand(userId) {
    const user = await User.findById(userId);
    if (!user) return null;
    return deliverVerseToUser(user);
}

// ─────────────────────────────────────────────────────
// Start the cron scheduler
// Runs at the top of every hour
// ─────────────────────────────────────────────────────
function startScheduler() {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', () => {
        console.log('🕐 Cron triggered: checking for scheduled deliveries...');
        processScheduledDeliveries();
    }, {
        timezone: 'Asia/Kolkata'
    });

    console.log('🗓️  Verse delivery scheduler started (runs every hour)');
}

module.exports = {
    startScheduler,
    deliverVerseToUser,
    deliverVerseOnDemand,
    processScheduledDeliveries,
    getVerseByIndex,
    getQuranVersesByIndex,
    loadDataset,
    loadQuranDataset,
    getEffectiveChannel
};
