// ═══════════════════════════════════════════════════════
// controllers/subscribeController.js — Public Subscription Endpoint
// Handles Free Trial (auto email via Resend) & Basic ₹49 (manual file)
// ═══════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerseEmail } = require('../services/emailService');
const { getVerseByIndex, loadDataset } = require('../services/schedulerService');
const { formatEmailHTML, formatEmailSubject } = require('../services/messageFormatter');

// Path to the manual subscriptions file (outside backend & frontend)
const SUBSCRIPTIONS_FILE = path.join(__dirname, '..', '..', 'subscriptions.json');

// Generate unique referral code
const generateReferralCode = (name) => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, '').slice(0, 5);
    const rand = crypto.randomBytes(3).toString('hex');
    return `${slug}_${rand}`;
};

// ─────────────────────────────────────────────────────
// POST /api/subscribe — Public subscription endpoint
// No auth required. Handles free trial & basic plan signups.
// ─────────────────────────────────────────────────────
const subscribe = async (req, res, next) => {
    try {
        const {
            name,
            email,
            book,
            religion,
            language,
            preferredTime,
            deliveryChannel,
            whatsappNumber,
            planId
        } = req.body;

        // ── Validate required fields ──
        const errors = [];
        if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
        if (!book) errors.push('Please select a book');
        if (!religion) errors.push('Religion is required');
        if (!language) errors.push('Language is required');

        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: errors.join(', ') });
        }

        // ── Check if user already exists ──
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

        if (existingUser) {
            // If user exists but expired, allow re-subscribe
            if (existingUser.subscriptionStatus !== 'expired') {
                return res.status(409).json({
                    success: false,
                    message: 'An account with this email already exists and is active.'
                });
            }
        }

        const now = new Date();

        // ── Determine plan-specific settings ──
        let subscriptionStatus, trialExpiry, subscriptionExpiry;

        if (planId === 'free') {
            subscriptionStatus = 'trial';
            trialExpiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
        } else if (planId === 'basic_monthly') {
            subscriptionStatus = 'paid_basic';
            subscriptionExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        } else {
            // For standard, premium, yearly — we'll add payment later
            return res.status(400).json({
                success: false,
                message: 'Payment integration for this plan is coming soon. Please choose Free Trial or Basic for now.'
            });
        }

        // ── Create or update user ──
        let user;

        if (existingUser) {
            // Re-activate expired user
            existingUser.name = name.trim();
            existingUser.religion = religion;
            existingUser.language = language;
            existingUser.preferredTime = planId === 'free' || planId === 'basic_monthly' ? 7 : (preferredTime || 7);
            existingUser.deliveryChannel = 'email'; // Free & basic = email only
            existingUser.subscriptionStatus = subscriptionStatus;
            existingUser.trialStartDate = planId === 'free' ? now : null;
            existingUser.trialExpiry = planId === 'free' ? trialExpiry : null;
            existingUser.subscriptionStartDate = planId === 'basic_monthly' ? now : null;
            existingUser.subscriptionExpiry = planId === 'basic_monthly' ? subscriptionExpiry : null;
            existingUser.isActive = true;
            existingUser.currentVerseIndex = 0; // Reset progress
            await existingUser.save();
            user = existingUser;
        } else {
            user = await User.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                ...(whatsappNumber ? { whatsappNumber } : {}),
                religion,
                language,
                preferredTime: planId === 'free' || planId === 'basic_monthly' ? 7 : (preferredTime || 7),
                deliveryChannel: 'email',
                isWhatsappOptedIn: false,
                isEmailOptedIn: true,
                signupSource: 'organic',
                referralCode: generateReferralCode(name),
                subscriptionStatus,
                trialStartDate: planId === 'free' ? now : null,
                trialExpiry: planId === 'free' ? trialExpiry : null,
                subscriptionStartDate: planId === 'basic_monthly' ? now : null,
                subscriptionExpiry: planId === 'basic_monthly' ? subscriptionExpiry : null,
            });
        }

        // ── Plan-specific actions ──

        if (planId === 'free') {
            // FREE TRIAL: Send first verse immediately via Resend
            try {
                const verse = getVerseByIndex(0);
                if (verse) {
                    const subject = formatEmailSubject(verse);
                    const html = formatEmailHTML(verse, user);
                    const emailResult = await sendVerseEmail(user.email, subject, html);

                    if (emailResult.success) {
                        // Update user progress
                        await User.findByIdAndUpdate(user._id, {
                            $inc: { currentVerseIndex: 1, totalVersesReceived: 1 },
                            lastVerseDeliveredAt: new Date(),
                            lastActivityAt: new Date()
                        });
                        console.log(`✅ Free trial: First verse sent to ${user.email}`);
                    } else {
                        console.error(`⚠️ Free trial: Failed to send first verse to ${user.email}:`, emailResult.error);
                    }
                }
            } catch (emailError) {
                console.error(`⚠️ Free trial email error for ${user.email}:`, emailError.message);
                // Don't fail the subscription — email will be sent by scheduler
            }
        }

        if (planId === 'basic_monthly') {
            // BASIC ₹49: Append to subscriptions.json for manual email sending
            try {
                let fileData = { subscribers: [] };
                try {
                    const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
                    fileData = JSON.parse(raw);
                } catch (e) {
                    // File doesn't exist or invalid, create fresh
                }

                // Check if already in list
                const alreadyInList = fileData.subscribers.some(
                    s => s.email.toLowerCase() === user.email.toLowerCase()
                );

                if (!alreadyInList) {
                    fileData.subscribers.push({
                        name: user.name,
                        email: user.email,
                        book: book,
                        language: user.language,
                        religion: user.religion,
                        plan: 'basic_monthly',
                        price: '₹49/mo',
                        subscribedAt: now.toISOString(),
                        status: 'active',
                        nextVerseIndex: 0,
                        notes: ''
                    });

                    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(fileData, null, 2), 'utf-8');
                    console.log(`📝 Basic subscriber added to file: ${user.email}`);
                }
            } catch (fileError) {
                console.error(`⚠️ Failed to write to subscriptions.json:`, fileError.message);
                // Don't fail — user is still in DB
            }
        }

        // ── Response ──
        res.status(201).json({
            success: true,
            message: planId === 'free'
                ? '🙏 Your 3-day free trial has started! Check your email for your first verse.'
                : '🙏 Thank you for subscribing! You will start receiving daily verses at 7:00 AM via email.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    religion: user.religion,
                    language: user.language,
                    book: book,
                    subscriptionStatus: user.subscriptionStatus,
                    deliveryChannel: user.deliveryChannel,
                    preferredTime: user.preferredTime,
                    trialExpiry: user.trialExpiry,
                    subscriptionExpiry: user.subscriptionExpiry
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { subscribe };
