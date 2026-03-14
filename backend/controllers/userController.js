



const User = require('../models/User');
const { RELIGIONS, LANGUAGES } = require('../config/constants');




const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
    'name', 'language', 'preferredTime', 'timezone',
    'isWhatsappOptedIn', 'isEmailOptedIn'];


    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }


    if (updates.language && !LANGUAGES.includes(updates.language)) {
      return res.status(400).json({
        success: false,
        message: `Language must be one of: ${LANGUAGES.join(', ')}`
      });
    }


    if (updates.preferredTime !== undefined) {
      const t = Number(updates.preferredTime);
      if (isNaN(t) || t < 5 || t > 22) {
        return res.status(400).json({
          success: false,
          message: 'Preferred time must be between 5 (5 AM) and 22 (10 PM)'
        });
      }
      updates.preferredTime = t;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};




const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();

    const dashboard = {
      name: user.name,
      religion: user.religion,
      language: user.language,
      subscription: {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        expiresAt: user.subscriptionExpiry
      },
      progress: {
        currentVerseIndex: user.currentVerseIndex,
        totalVersesReceived: user.totalVersesReceived,
        lastVerseDeliveredAt: user.lastVerseDeliveredAt
      },
      engagement: {
        streakCount: user.streakCount,
        longestStreak: user.longestStreak,
        lastActivityAt: user.lastActivityAt
      },
      preferences: {
        preferredTime: user.preferredTime,
        timezone: user.timezone,
        isWhatsappOptedIn: user.isWhatsappOptedIn,
        isEmailOptedIn: user.isEmailOptedIn
      },
      referral: {
        code: user.referralCode,
        link: `${process.env.CLIENT_URL || 'https://dailyfaith.in'}?ref=${user.referralCode}`
      }
    };

    res.status(200).json({
      success: true,
      data: { dashboard }
    });
  } catch (error) {
    next(error);
  }
};




const changeLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;

    if (!language || !LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Language must be one of: ${LANGUAGES.join(', ')}`
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { language },
      { new: true }
    ).select('name language');

    res.status(200).json({
      success: true,
      message: `Language changed to ${language}`,
      data: { language: user.language }
    });
  } catch (error) {
    next(error);
  }
};




const changeDeliveryTime = async (req, res, next) => {
  try {
    const { preferredTime } = req.body;
    const t = Number(preferredTime);

    if (isNaN(t) || t < 5 || t > 22) {
      return res.status(400).json({
        success: false,
        message: 'Preferred time must be between 5 (5 AM) and 22 (10 PM)'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferredTime: t },
      { new: true }
    ).select('name preferredTime');

    res.status(200).json({
      success: true,
      message: `Delivery time changed to ${t}:00`,
      data: { preferredTime: user.preferredTime }
    });
  } catch (error) {
    next(error);
  }
};




const deactivateAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isActive: false,
      isWhatsappOptedIn: false,
      isEmailOptedIn: false
    });

    res.status(200).json({
      success: true,
      message: 'Account deactivated. We\'re sorry to see you go 🙏'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  getDashboard,
  changeLanguage,
  changeDeliveryTime,
  deactivateAccount
};