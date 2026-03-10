// ═══════════════════════════════════════════════════════
// services/messageFormatter.js — Format verses for delivery
// ═══════════════════════════════════════════════════════

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────────
// Check if user is eligible for audio content
// Audio for: paid_standard, paid_premium (not free, trial, paid_basic)
// ─────────────────────────────────────────────────────
function userGetsAudio(user) {
  return ['paid_standard', 'paid_premium'].includes(user.subscriptionStatus);
}

// ─────────────────────────────────────────────────────
// Get audio URL for a verse (only Hindi & English)
// Audio files: {chapter}.{verse}_{hindi|english}.mp3
// ─────────────────────────────────────────────────────
function getAudioUrl(verseId, language) {
  // Only Hindi and English audio available
  const lang = language === 'hindi' ? 'hindi' : 'english';
  return `${BASE_URL}/audio/${verseId}_${lang}.mp3`;
}

// ─────────────────────────────────────────────────────
// Get the translation text for user's language
// ─────────────────────────────────────────────────────
function getTranslation(verse, language) {
  if (language === 'english') {
    return verse.english || verse.translations?.english || '';
  }
  return verse.translations?.[language] || verse.translations?.hindi || verse.english || '';
}

// ─────────────────────────────────────────────────────
// Format WhatsApp message (plain text with bold markers)
// ─────────────────────────────────────────────────────
function formatWhatsAppMessage(verse, user) {
  const chapter = verse.chapter;
  const verseNum = verse.verse;
  const sanskrit = verse.sanskrit || verse.originalText || '';
  const translation = getTranslation(verse, user.language);
  const includeAudio = userGetsAudio(user);

  let message = `🙏 *Bhagavad Gita – Chapter ${chapter} Verse ${verseNum}*\n\n`;
  message += `${sanskrit}\n\n`;
  message += `*Meaning:*\n${translation}`;

  if (includeAudio) {
    const audioUrl = getAudioUrl(verse.id, user.language);
    message += `\n\n🔊 *Listen to the chanting:*\n${audioUrl}`;
  }

  message += `\n\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📿 _DailyFaith — Your daily spiritual companion_`;

  return message;
}

// ─────────────────────────────────────────────────────
// Format Email HTML (beautiful spiritual template)
// ─────────────────────────────────────────────────────
function formatEmailHTML(verse, user) {
  const chapter = verse.chapter;
  const verseNum = verse.verse;
  const sanskrit = verse.sanskrit || verse.originalText || '';
  const translation = getTranslation(verse, user.language);
  const includeAudio = userGetsAudio(user);
  const audioUrl = includeAudio ? getAudioUrl(verse.id, user.language) : null;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bhagavad Gita – Chapter ${chapter} Verse ${verseNum}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FFF8F0; font-family: 'Georgia', 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF8F0;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF9933 0%, #FF6600 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 2px; text-transform: uppercase;">Daily Verse</p>
              <h1 style="margin: 8px 0 0 0; font-size: 26px; color: #FFFFFF; font-weight: bold;">
                🙏 Bhagavad Gita
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.85);">
                Chapter ${chapter} · Verse ${verseNum}
              </p>
            </td>
          </tr>

          <!-- Sanskrit Verse -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px; border-left: 1px solid #F0E0D0; border-right: 1px solid #F0E0D0;">
              <div style="background-color: #FFF5EB; border-left: 4px solid #FF9933; padding: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 18px; line-height: 1.8; color: #8B4513; text-align: center; font-style: italic;">
                  ${sanskrit.replace(/\n/g, '<br>')}
                </p>
              </div>
            </td>
          </tr>

          <!-- Translation -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 40px 40px 40px; border-left: 1px solid #F0E0D0; border-right: 1px solid #F0E0D0;">
              <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #FF9933; text-transform: uppercase; letter-spacing: 1px;">
                ✦ Meaning
              </h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #333333;">
                ${translation.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

          ${includeAudio ? `
          <!-- Audio Section (Standard/Premium Only) -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 40px 40px 40px; border-left: 1px solid #F0E0D0; border-right: 1px solid #F0E0D0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #FFF5EB 0%, #FFE8D6 100%); padding: 20px 24px; border-radius: 12px; text-align: center;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #8B4513;">
                      🔊 Listen to the chanting
                    </p>
                    <a href="${audioUrl}" style="display: inline-block; background-color: #FF9933; color: #FFFFFF; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: bold; letter-spacing: 0.5px;">
                      ▶ Play Audio
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background-color: #2D1810; padding: 32px 40px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">
                📿 DailyFaith — Your daily spiritual companion
              </p>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                You're receiving this because you subscribed to DailyFaith.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
}

// ─────────────────────────────────────────────────────
// Format email subject line
// ─────────────────────────────────────────────────────
function formatEmailSubject(verse) {
  return `🙏 Bhagavad Gita – Chapter ${verse.chapter} Verse ${verse.verse} | DailyFaith`;
}

module.exports = {
  formatWhatsAppMessage,
  formatEmailHTML,
  formatEmailSubject,
  userGetsAudio,
  getAudioUrl,
  getTranslation
};
