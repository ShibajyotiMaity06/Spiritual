




const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerseEmail } = require('../services/emailService');
const { getVerseByIndex, getQuranVersesByIndex, getBibleVerseByIndex, loadDataset, loadQuranDataset, loadBibleDataset } = require('../services/schedulerService');
const { formatEmailHTML, formatEmailSubject, formatQuranEmailHTML, formatQuranEmailSubject, formatBibleEmailHTML, formatBibleEmailSubject } = require('../services/messageFormatter');


const SUBSCRIPTIONS_FILE = path.join(__dirname, '..', 'data', 'subscriptions.json');

const PAYMENTS_FILE = path.join(__dirname, '..', 'data', 'payments.json');


const generateReferralCode = (name) => {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '').slice(0, 5);
  const rand = crypto.randomBytes(3).toString('hex');
  return `${slug}_${rand}`;
};





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
      planId,
      paidByName
    } = req.body;


    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
    if (!book) errors.push('Please select a book');
    if (!religion) errors.push('Religion is required');
    if (!language) errors.push('Language is required');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }


    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {

      if (existingUser.subscriptionStatus !== 'expired') {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists and is active.'
        });
      }
    }

    const now = new Date();


    let subscriptionStatus, trialExpiry, subscriptionExpiry;

    const PLAN_MAP = {
      'free': { status: 'trial', durationDays: 3 },
      'basic_monthly': { status: 'paid_basic', durationDays: 30 },
      'standard_monthly': { status: 'paid_standard', durationDays: 30 },
      'premium_monthly': { status: 'paid_premium', durationDays: 30 },
      'premium_yearly': { status: 'paid_premium', durationDays: 365 }
    };

    const planConfig = PLAN_MAP[planId];
    if (!planConfig) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected.' });
    }

    subscriptionStatus = planConfig.status;
    const isPaid = planId !== 'free';
    const isPendingPayment = isPaid;

    if (planId === 'free') {
      trialExpiry = new Date(now.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);
    } else {


      subscriptionExpiry = new Date(now.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);
    }


    if (isPaid && (!paidByName || !paidByName.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide the name shown on your UPI payment.' });
    }


    let user;

    if (existingUser) {

      existingUser.name = name.trim();
      existingUser.religion = religion;
      existingUser.book = book;
      existingUser.language = language;
      existingUser.preferredTime = planId === 'free' || planId === 'basic_monthly' ? 7 : preferredTime || 7;
      existingUser.deliveryChannel = planId === 'free' || planId === 'basic_monthly' ? 'email' : deliveryChannel || 'email';
      existingUser.subscriptionStatus = subscriptionStatus;
      existingUser.trialStartDate = planId === 'free' ? now : null;
      existingUser.trialExpiry = planId === 'free' ? trialExpiry : null;
      existingUser.subscriptionStartDate = isPaid ? now : null;
      existingUser.subscriptionExpiry = isPaid ? subscriptionExpiry : null;
      existingUser.isActive = planId === 'free';
      existingUser.currentVerseIndex = 0;
      await existingUser.save();
      user = existingUser;
    } else {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        ...(whatsappNumber ? { whatsappNumber } : {}),
        religion,
        book,
        language,
        preferredTime: planId === 'free' || planId === 'basic_monthly' ? 7 : preferredTime || 7,
        deliveryChannel: planId === 'free' || planId === 'basic_monthly' ? 'email' : deliveryChannel || 'email',
        isWhatsappOptedIn: false,
        isEmailOptedIn: true,
        signupSource: 'organic',
        referralCode: generateReferralCode(name),
        subscriptionStatus,
        trialStartDate: planId === 'free' ? now : null,
        trialExpiry: planId === 'free' ? trialExpiry : null,
        subscriptionStartDate: isPaid ? now : null,
        subscriptionExpiry: isPaid ? subscriptionExpiry : null,
        isActive: planId === 'free'
      });
    }



    if (planId === 'free') {

      try {
        let subject,html,advanceBy = 1;

        if (book === 'quran') {

          const quranPair = getQuranVersesByIndex(0);
          if (quranPair) {
            subject = formatQuranEmailSubject(quranPair.verses);
            html = formatQuranEmailHTML(quranPair.verses, user);
            advanceBy = quranPair.advanceBy;
          }
        } else if (book === 'bible') {

          const verse = getBibleVerseByIndex(0);
          if (verse) {
            subject = formatBibleEmailSubject(verse);
            html = formatBibleEmailHTML(verse, user, null);
          }
        } else {

          const verse = getVerseByIndex(0);
          if (verse) {
            subject = formatEmailSubject(verse);
            html = formatEmailHTML(verse, user);
          }
        }

        if (subject && html) {
          const emailResult = await sendVerseEmail(user.email, subject, html);

          if (emailResult.success) {

            await User.findByIdAndUpdate(user._id, {
              $inc: { currentVerseIndex: advanceBy, totalVersesReceived: advanceBy },
              lastVerseDeliveredAt: new Date(),
              lastActivityAt: new Date()
            });
            console.log(`✅ Free trial: First ${book} verse(s) sent to ${user.email}`);
          } else {
            console.error(`⚠️ Free trial: Failed to send first verse to ${user.email}:`, emailResult.error);
          }
        }
      } catch (emailError) {
        console.error(`⚠️ Free trial email error for ${user.email}:`, emailError.message);

      }
    }

    if (isPaid) {

      const PRICE_MAP = {
        'basic_monthly': '₹49/mo',
        'standard_monthly': '₹99/mo',
        'premium_monthly': '₹149/mo',
        'premium_yearly': '₹1,599/yr'
      };

      try {
        let fileData = { payments: [] };
        try {
          const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
          if (raw.trim()) fileData = JSON.parse(raw);
        } catch (e) {

        }

        fileData.payments.push({
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          whatsappNumber: user.whatsappNumber || null,
          paidByName: paidByName.trim(),
          plan: planId,
          price: PRICE_MAP[planId] || planId,
          book: book,
          language: user.language,
          deliveryChannel: user.deliveryChannel,
          preferredTime: user.preferredTime,
          submittedAt: now.toISOString(),
          verified: false,
          activatedAt: null,
          notes: ''
        });

        fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(fileData, null, 2), 'utf-8');
        console.log(`💰 Payment logged for ${user.email} — plan: ${planId}, paidBy: ${paidByName}`);
      } catch (fileError) {
        console.error(`⚠️ Failed to write to payments.json:`, fileError.message);
      }


      try {
        let subData = { subscribers: [] };
        try {
          const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
          subData = JSON.parse(raw);
        } catch (e) {}

        const alreadyInList = subData.subscribers.some(
          (s) => s.email.toLowerCase() === user.email.toLowerCase()
        );

        if (!alreadyInList) {
          subData.subscribers.push({
            name: user.name,
            email: user.email,
            book: book,
            language: user.language,
            religion: user.religion,
            plan: planId,
            price: PRICE_MAP[planId] || planId,
            subscribedAt: now.toISOString(),
            status: 'pending_payment_verification',
            nextVerseIndex: 0,
            notes: ''
          });

          fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subData, null, 2), 'utf-8');
        }
      } catch (fileError) {
        console.error(`⚠️ Failed to write to subscriptions.json:`, fileError.message);
      }
    }


    res.status(201).json({
      success: true,
      message: planId === 'free' ?
      '🙏 Your 3-day free trial has started! Check your email for your first verse.' :
      '🙏 Payment submitted! We will verify and activate your subscription within 4 hours.',
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