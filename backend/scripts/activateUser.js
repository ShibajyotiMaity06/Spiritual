// ═══════════════════════════════════════════════════════
// scripts/activateUser.js — Manually activate a paid user
// Usage: node scripts/activateUser.js <email-or-whatsapp>
// Examples:
//   node scripts/activateUser.js nav71063@gmail.com
//   node scripts/activateUser.js +919876543210
//   node scripts/activateUser.js 9876543210
// ═══════════════════════════════════════════════════════

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const { sendVerseEmail } = require('../services/emailService');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { getVerseByIndex, getQuranVersesByIndex, getBibleVerseByIndex, loadDataset, loadQuranDataset, loadBibleDataset } = require('../services/schedulerService');
const {
    formatEmailHTML, formatEmailSubject,
    formatQuranEmailHTML, formatQuranEmailSubject,
    formatBibleEmailHTML, formatBibleEmailSubject,
    formatWhatsAppMessage: formatWhatsAppMsg,
    formatQuranWhatsAppMessage,
    formatBibleWhatsAppMessage,
    userGetsAudio, getAudioUrl
} = require('../services/messageFormatter');
const { sendWhatsAppAudio } = require('../services/whatsappService');

const PAYMENTS_FILE = path.join(__dirname, '..', 'data', 'payments.json');

function isEmail(input) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function normalizePhone(input) {
    let digits = input.replace(/[^0-9]/g, '');
    if (digits.length === 10) digits = '91' + digits;
    return digits;
}

async function activateUser(identifier) {
    if (!identifier) {
        console.error('❌ Usage: node scripts/activateUser.js <email-or-whatsapp-number>');
        console.error('   Examples:');
        console.error('     node scripts/activateUser.js user@example.com');
        console.error('     node scripts/activateUser.js 9876543210');
        console.error('     node scripts/activateUser.js +919876543210');
        process.exit(1);
    }

    identifier = identifier.trim();
    const lookupByEmail = isEmail(identifier);

    console.log(`\n🔍 Looking up user by ${lookupByEmail ? 'email' : 'WhatsApp number'}: ${identifier}\n`);

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find user by email or whatsapp number
        let user;
        if (lookupByEmail) {
            user = await User.findOne({ email: identifier.toLowerCase() });
        } else {
            const phone = normalizePhone(identifier);
            // Try multiple formats the number might be stored as
            user = await User.findOne({
                $or: [
                    { whatsappNumber: phone },
                    { whatsappNumber: '+' + phone },
                    { whatsappNumber: identifier },
                ]
            });
        }

        if (!user) {
            console.error(`❌ No user found with ${lookupByEmail ? 'email' : 'WhatsApp number'}: ${identifier}`);
            process.exit(1);
        }

        const channel = user.deliveryChannel || 'email';
        console.log(`📋 User found:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email || '—'}`);
        console.log(`   WhatsApp: ${user.whatsappNumber || '—'}`);
        console.log(`   Plan: ${user.subscriptionStatus}`);
        console.log(`   Book: ${user.book || 'bhagavad_gita'}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Delivery: ${channel} at ${user.preferredTime}:00`);
        console.log(`   Subscription Expiry: ${user.subscriptionExpiry}`);

        if (user.isActive) {
            console.log(`\n⚠️  User is already active! No action needed.`);
            process.exit(0);
        }

        // Activate user
        user.isActive = true;
        user.lastActivityAt = new Date();
        await user.save();
        console.log(`\n✅ User activated! ${user.name} is now ACTIVE.`);

        // ── Send first verse immediately on activation via user's chosen channel ──
        try {
            const userBook = user.book || 'bhagavad_gita';
            const isQuran = userBook === 'quran';
            const isBible = userBook === 'bible';
            let advanceBy = 1;
            let sent = false;

            if (channel === 'whatsapp' && user.whatsappNumber) {
                // ── WhatsApp delivery ──
                let whatsappText;
                if (isQuran) {
                    loadQuranDataset();
                    const quranPair = getQuranVersesByIndex(0);
                    if (quranPair) {
                        whatsappText = formatQuranWhatsAppMessage(quranPair.verses, user, null);
                        advanceBy = quranPair.advanceBy;
                    }
                } else if (isBible) {
                    loadBibleDataset();
                    const verse = getBibleVerseByIndex(0);
                    if (verse) {
                        whatsappText = formatBibleWhatsAppMessage(verse, user, null);
                    }
                } else {
                    loadDataset();
                    const verse = getVerseByIndex(0);
                    if (verse) {
                        whatsappText = formatWhatsAppMsg(verse, user, null);
                        // Send audio separately if eligible
                        if (userGetsAudio(user)) {
                            const audioUrl = getAudioUrl(verse.id, user.language);
                            await sendWhatsAppAudio(user.whatsappNumber, audioUrl);
                        }
                    }
                }
                if (whatsappText) {
                    const result = await sendWhatsAppMessage(user.whatsappNumber, whatsappText);
                    sent = result.success;
                    console.log(`📱 First verse sent via WhatsApp to ${user.whatsappNumber} (${sent ? '✅' : '❌'})`);
                }
            } else {
                // ── Email delivery ──
                let subject, html;
                if (isQuran) {
                    loadQuranDataset();
                    const quranPair = getQuranVersesByIndex(0);
                    if (quranPair) {
                        subject = formatQuranEmailSubject(quranPair.verses);
                        html = formatQuranEmailHTML(quranPair.verses, user, null);
                        advanceBy = quranPair.advanceBy;
                    }
                } else if (isBible) {
                    loadBibleDataset();
                    const verse = getBibleVerseByIndex(0);
                    if (verse) {
                        subject = formatBibleEmailSubject(verse);
                        html = formatBibleEmailHTML(verse, user, null);
                    }
                } else {
                    loadDataset();
                    const verse = getVerseByIndex(0);
                    if (verse) {
                        subject = formatEmailSubject(verse);
                        html = formatEmailHTML(verse, user, null);
                    }
                }
                if (subject && html) {
                    const emailResult = await sendVerseEmail(user.email, subject, html);
                    sent = emailResult.success;
                    console.log(`📧 First verse sent via email to ${user.email} (${sent ? '✅' : '❌'})`);
                }
            }

            if (sent) {
                await User.findByIdAndUpdate(user._id, {
                    $inc: { currentVerseIndex: advanceBy, totalVersesReceived: advanceBy },
                    lastVerseDeliveredAt: new Date(),
                    lastActivityAt: new Date()
                });
                console.log(`   Advanced verse index by ${advanceBy}`);
            }
        } catch (deliveryError) {
            console.error(`⚠️  Delivery error:`, deliveryError.message);
            console.log(`   Scheduler will send the first verse at ${user.preferredTime}:00 IST.`);
        }

        console.log(`   Daily verses will continue at ${user.preferredTime}:00 IST via ${channel}.`);

        // Update payments.json — mark as verified
        try {
            const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
            const fileData = JSON.parse(raw);
            const payment = fileData.payments.find(p => {
                if (lookupByEmail) {
                    return p.email?.toLowerCase() === identifier.toLowerCase() && !p.verified;
                } else {
                    const phone = normalizePhone(identifier);
                    const pPhone = p.whatsappNumber ? normalizePhone(p.whatsappNumber) : '';
                    return pPhone === phone && !p.verified;
                }
            });
            if (payment) {
                payment.verified = true;
                payment.activatedAt = new Date().toISOString();
                payment.notes = `Manually activated via script (${lookupByEmail ? 'email' : 'whatsapp'})`;
                fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(fileData, null, 2), 'utf-8');
                console.log(`✅ payments.json updated — marked as verified.`);
            }
        } catch (e) {
            console.warn(`⚠️  Could not update payments.json:`, e.message);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB.\n');
    }
}

// Run with identifier from CLI argument
activateUser(process.argv[2]);
