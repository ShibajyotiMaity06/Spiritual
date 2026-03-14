const { RELIGIONS, LANGUAGES } = require('../config/constants');
const { generateReflection } = require('../services/geminiService');

const createReflection = async (req, res, next) => {
  try {
    const { prompt, religion, language, verseText } = req.body || {};

    if (!prompt || String(prompt).trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'prompt is required and must be at least 5 characters'
      });
    }

    const promptText = String(prompt).trim();
    if (promptText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'prompt must not exceed 500 characters'
      });
    }

    if (religion && !RELIGIONS.includes(religion)) {
      return res.status(400).json({
        success: false,
        message: `religion must be one of: ${RELIGIONS.join(', ')}`
      });
    }

    if (language && !LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `language must be one of: ${LANGUAGES.join(', ')}`
      });
    }

    const aiResponse = await generateReflection({
      prompt: promptText,
      religion: religion || req.user?.religion,
      language: language || req.user?.language || 'english',
      verseText: verseText || ''
    });

    return res.status(200).json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createReflection
};
