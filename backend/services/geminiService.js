const axios = require('axios');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || '';
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeModelJson(rawText) {
  const trimmed = (rawText || '').trim();
  const direct = safeJsonParse(trimmed);
  if (direct) return direct;

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  return safeJsonParse(trimmed.slice(start, end + 1));
}

async function generateReflection({ prompt, religion, language, verseText }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is missing in backend environment');
    err.statusCode = 500;
    throw err;
  }

  const userPrompt = String(prompt || '').trim();
  const contextLines = [
    `Religion: ${religion || 'unspecified'}`,
    `Language: ${language || 'english'}`,
    `Verse: ${verseText || 'not provided'}`,
    `User prompt: ${userPrompt}`
  ].join('\n');

  const instruction = [
    'You are a calm spiritual guide for a daily devotional app.',
    'Use neutral, respectful language and do not make medical, legal, or financial claims.',
    'Respond as strict JSON with keys: reflection, practical_step, prayer.',
    'Each field must be a concise plain string.'
  ].join(' ');

  const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${instruction}\n\n${contextLines}` }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
      topP: 0.9
    }
  };

  const response = await axios.post(url, payload, {
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
  });

  const parts = response.data?.candidates?.[0]?.content?.parts || [];
  const rawText = parts.map((p) => p?.text || '').join('\n').trim();

  if (!rawText) {
    const err = new Error('Gemini returned an empty response');
    err.statusCode = 502;
    throw err;
  }

  const normalized = normalizeModelJson(rawText) || {
    reflection: rawText,
    practical_step: 'Take one small intentional action aligned with this reflection today.',
    prayer: 'May peace, clarity, and compassion guide your day.'
  };

  return {
    reflection: String(normalized.reflection || '').trim(),
    practicalStep: String(normalized.practical_step || normalized.practicalStep || '').trim(),
    prayer: String(normalized.prayer || '').trim(),
    model: GEMINI_MODEL
  };
}

module.exports = {
  generateReflection
};
