// ═══════════════════════════════════════════════════════
// controllers/authController.js — Registration & Login
// ═══════════════════════════════════════════════════════

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Generate unique referral code
const generateReferralCode = (name) => {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '').slice(0, 5);
  const rand = crypto.randomBytes(3).toString('hex');
  return `${slug}_${rand}`;
};

// ─────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      whatsappNumber,
      religion,
      language,
      preferredTime,
      deliveryChannel, // 'whatsapp' or 'email'
      signupSource
    } = req.body;

    // Check duplicates
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(whatsappNumber ? [{ whatsappNumber }] : [])
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email.toLowerCase()
          ? 'An account with this email already exists'
          : 'An account with this WhatsApp number already exists'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      whatsappNumber: whatsappNumber || null,
      religion,
      language,
      preferredTime: preferredTime || 6,
      deliveryChannel: deliveryChannel || 'whatsapp',
      isWhatsappOptedIn: deliveryChannel === 'whatsapp',
      isEmailOptedIn: deliveryChannel === 'email',
      signupSource: signupSource || 'organic',
      referralCode: generateReferralCode(name),
      subscriptionStatus: 'free'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to DailyFaith 🙏',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          religion: user.religion,
          language: user.language,
          subscriptionStatus: user.subscriptionStatus,
          referralCode: user.referralCode,
          deliveryChannel: user.deliveryChannel || deliveryChannel
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, whatsappNumber } = req.body;

    if (!email && !whatsappNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or WhatsApp number'
      });
    }

    // Find user by email or WhatsApp
    const query = email
      ? { email: email.toLowerCase().trim() }
      : { whatsappNumber };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with these credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support.'
      });
    }

    // Update last activity
    user.lastActivityAt = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          religion: user.religion,
          language: user.language,
          subscriptionStatus: user.subscriptionStatus,
          preferredTime: user.preferredTime,
          streakCount: user.streakCount,
          totalVersesReceived: user.totalVersesReceived,
          referralCode: user.referralCode
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// GET /api/auth/me — Get current user profile
// ─────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-__v')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
