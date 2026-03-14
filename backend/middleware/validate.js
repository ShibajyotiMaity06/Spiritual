



const { RELIGIONS, LANGUAGES } = require('../config/constants');


const requireFields = (...fields) => {
  return (req, res, next) => {
    const missing = fields.filter((f) => {
      const value = req.body[f];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    next();
  };
};


const validateRegistration = (req, res, next) => {
  const { name, email, religion, language, deliveryChannel } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!religion || !RELIGIONS.includes(religion)) {
    errors.push(`Religion must be one of: ${RELIGIONS.join(', ')}`);
  }

  if (!language || !LANGUAGES.includes(language)) {
    errors.push(`Language must be one of: ${LANGUAGES.join(', ')}`);
  }

  if (!deliveryChannel || !['whatsapp', 'email'].includes(deliveryChannel)) {
    errors.push('Delivery channel must be "whatsapp" or "email"');
  }

  if (deliveryChannel === 'whatsapp') {
    const { whatsappNumber } = req.body;
    if (!whatsappNumber || !/^\+?\d{10,15}$/.test(whatsappNumber)) {
      errors.push('Valid WhatsApp number is required (10-15 digits)');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};


const validateVerseQuery = (req, res, next) => {
  const { religion, language } = req.query;
  const errors = [];

  if (religion && !RELIGIONS.includes(religion)) {
    errors.push(`Religion must be one of: ${RELIGIONS.join(', ')}`);
  }

  if (language && !LANGUAGES.includes(language)) {
    errors.push(`Language must be one of: ${LANGUAGES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};


const validatePlanSelection = (req, res, next) => {
  const validPlans = ['basic_monthly', 'standard_monthly', 'premium_monthly', 'premium_yearly'];
  const { plan } = req.body;

  if (!plan || !validPlans.includes(plan)) {
    return res.status(400).json({
      success: false,
      message: `Plan must be one of: ${validPlans.join(', ')}`
    });
  }

  next();
};

module.exports = {
  requireFields,
  validateRegistration,
  validateVerseQuery,
  validatePlanSelection
};