// ═══════════════════════════════════════════════════════
// services/messageFormatter.js — Format verses for delivery
// ═══════════════════════════════════════════════════════

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────────
// Check if user is eligible for audio content
// Audio for: paid_standard, paid_premium
// Bible has NO audio regardless of plan
// ─────────────────────────────────────────────────────
function userGetsAudio(user) {
  if (user.book === 'bible') return false;
  return ['paid_standard', 'paid_premium'].includes(user.subscriptionStatus);
}

// ─────────────────────────────────────────────────────
// Get audio URL for a verse (only Hindi & English)
// ─────────────────────────────────────────────────────
function getAudioUrl(verseId, language) {
  const lang = language === 'hindi' ? 'hindi' : 'english';
  return `${BASE_URL}/audio/${verseId}_${lang}.mp3`;
}

// ─────────────────────────────────────────────────────
// Get the translation text for user's language (Gita)
// ─────────────────────────────────────────────────────
function getTranslation(verse, language) {
  if (language === 'english') {
    return verse.english || verse.translations?.english || '';
  }
  return verse.translations?.[language] || verse.translations?.hindi || verse.english || '';
}

// ─────────────────────────────────────────────────────
// Generate streak HTML block (reusable across books)
// streak = { day: number, message: string } or null
// ─────────────────────────────────────────────────────
function buildStreakEmailBlock(streak, themeColor) {
  if (!streak) return '';
  return `
          <!-- Streak Section -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 40px 16px 40px; border-left: 1px solid #E0E0E0; border-right: 1px solid #E0E0E0;">
              <div style="background: linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}25 100%); padding: 16px 20px; border-radius: 12px; text-align: center; border: 1px solid ${themeColor}40;">
                <p style="margin: 0 0 4px 0; font-size: 22px;">🔥</p>
                <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold; color: ${themeColor};">
                  Day ${streak.day} Streak
                </p>
                <p style="margin: 0; font-size: 13px; color: #555555; font-style: italic;">
                  ${streak.message}
                </p>
              </div>
            </td>
          </tr>`;
}

function buildStreakWhatsApp(streak) {
  if (!streak) return '';
  return `\n\n🔥 *Day ${streak.day} Streak*\n_${streak.message}_`;
}

// ═══════════════════════════════════════════════════════
// GITA FORMATTERS
// ═══════════════════════════════════════════════════════

function formatWhatsAppMessage(verse, user, streak) {
  const chapter = verse.chapter;
  const verseNum = verse.verse;
  const sanskrit = verse.sanskrit || verse.originalText || '';
  const englishTranslation = verse.english || verse.translations?.english || '';
  const userLang = user.language || 'hindi';
  const userTranslation = userLang !== 'english' ? getTranslation(verse, userLang) : '';
  const includeAudio = userGetsAudio(user);

  let message = `🙏 *Bhagavad Gita – Chapter ${chapter} Verse ${verseNum}*\n\n`;
  message += `${sanskrit}\n\n`;
  message += `*English Meaning:*\n${englishTranslation}`;

  if (userTranslation) {
    const LANG_LABELS_WA = {
      hindi: 'हिन्दी', tamil: 'தமிழ்', malayalam: 'മലയാളം',
      bengali: 'বাংলা', telugu: 'తెలుగు', kannada: 'ಕನ್ನಡ', urdu: 'اردو'
    };
    const label = LANG_LABELS_WA[userLang] || userLang;
    message += `\n\n*${label} अनुवाद:*\n${userTranslation}`;
  }

  if (includeAudio) {
    const audioUrl = getAudioUrl(verse.id, user.language);
    message += `\n\n🔊 *Listen to the chanting:*\n${audioUrl}`;
  }

  message += buildStreakWhatsApp(streak);
  message += `\n\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📿 _DailyFaith — Your daily spiritual companion_`;

  return message;
}

function formatEmailSubject(verse) {
  return `🙏 Bhagavad Gita – Chapter ${verse.chapter} Verse ${verse.verse} | DailyFaith`;
}

function formatEmailHTML(verse, user, streak) {
  const chapter = verse.chapter;
  const verseNum = verse.verse;
  const sanskrit = verse.sanskrit || verse.originalText || '';
  const englishTranslation = verse.english || verse.translations?.english || '';
  const userLang = user.language || 'hindi';
  const userTranslation = userLang !== 'english' ? getTranslation(verse, userLang) : '';
  const includeAudio = userGetsAudio(user);
  const audioUrl = includeAudio ? getAudioUrl(verse.id, user.language) : null;

  const LANG_LABELS = {
    hindi: 'हिन्दी अनुवाद', tamil: 'தமிழ் மொழிபெயர்ப்பு', malayalam: 'മലയാളം വിവർത്തനം',
    bengali: 'বাংলা অনুবাদ', telugu: 'తెలుగు అనువాదం', kannada: 'ಕನ್ನಡ ಅನುವಾದ', urdu: 'اردو ترجمہ'
  };
  const userLangLabel = LANG_LABELS[userLang] || `${userLang.charAt(0).toUpperCase() + userLang.slice(1)} Translation`;

  return `
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

          <!-- English Translation -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 40px 32px 40px; border-left: 1px solid #F0E0D0; border-right: 1px solid #F0E0D0;">
              <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #FF9933; text-transform: uppercase; letter-spacing: 1px;">
                ✦ English Meaning
              </h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #333333;">
                ${englishTranslation.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

          ${userTranslation ? `
          <!-- User's Language Translation -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 40px 40px 40px; border-left: 1px solid #F0E0D0; border-right: 1px solid #F0E0D0;">
              <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #FF9933; text-transform: uppercase; letter-spacing: 1px;">
                ✦ ${userLangLabel}
              </h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #333333;">
                ${userTranslation.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>
          ` : ''}

          ${includeAudio ? `
          <!-- Audio Section -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 40px 24px 40px; border-left: 1px solid #F0E0D0; border-right: 1px solid #F0E0D0;">
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

          ${buildStreakEmailBlock(streak, '#FF9933')}

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
}

// ═══════════════════════════════════════════════════════
// QURAN FORMATTERS
// ═══════════════════════════════════════════════════════

function formatQuranWhatsAppMessage(verses, user, streak) {
  const first = verses[0];
  const surahName = first.transliteration;
  const surahMeaning = first.surahMeaning;
  const surahNum = first.surah;
  const includeAudio = userGetsAudio(user);

  let message = `☪️ *Quran – Surah ${surahNum}: ${surahName} (${surahMeaning})*\n\n`;

  verses.forEach((v, i) => {
    if (verses.length > 1) {
      message += `━━━ *Verse ${v.verse}* ━━━\n\n`;
    }
    message += `${v.arabic}\n\n`;
    message += `*English:* ${v.english}\n`;
    if (includeAudio) {
      message += `\n🔊 Audio: ${v.audio}\n`;
    }
    if (i < verses.length - 1) message += `\n`;
  });

  message += buildStreakWhatsApp(streak);
  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📿 _DailyFaith — Your daily spiritual companion_`;

  return message;
}

function formatQuranEmailSubject(verses) {
  const first = verses[0];
  const verseNums = verses.map(v => v.verse).join(' & ');
  return `☪️ Quran – Surah ${first.surah}: ${first.transliteration} · Verse ${verseNums} | DailyFaith`;
}

function formatQuranEmailHTML(verses, user, streak) {
  const first = verses[0];
  const surahNum = first.surah;
  const surahName = first.name;
  const transliteration = first.transliteration;
  const surahMeaning = first.surahMeaning;
  const verseNums = verses.map(v => v.verse).join(' & ');
  const includeAudio = userGetsAudio(user);

  let verseBlocksHTML = '';
  verses.forEach((v, i) => {
    const isLast = i === verses.length - 1;
    verseBlocksHTML += `
          <tr>
            <td style="background-color: #FFFFFF; padding: ${i === 0 ? '40px 40px 16px' : '24px 40px 16px'} 40px; border-left: 1px solid #D4EDDA; border-right: 1px solid #D4EDDA;">
              ${verses.length > 1 ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: #28A745; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Verse ${v.verse}</p>` : ''}
              <div style="background-color: #F0FFF4; border-right: 4px solid #28A745; padding: 24px; border-radius: 8px 0 0 8px; text-align: right; direction: rtl;">
                <p style="margin: 0; font-size: 24px; line-height: 2; color: #155724; font-family: 'Traditional Arabic', 'Scheherazade New', serif;">
                  ${v.arabic}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #FFFFFF; padding: 16px 40px ${(isLast && !includeAudio) ? '40px' : '8px'} 40px; border-left: 1px solid #D4EDDA; border-right: 1px solid #D4EDDA;">
              <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #333333;">
                <span style="color: #28A745; font-weight: bold;">${v.verse}.</span> ${v.english}
              </p>
            </td>
          </tr>
          ${includeAudio ? `
          <tr>
            <td style="background-color: #FFFFFF; padding: 12px 40px 24px 40px; border-left: 1px solid #D4EDDA; border-right: 1px solid #D4EDDA;">
              <a href="${v.audio}" style="display: inline-block; background-color: #28A745; color: #FFFFFF; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">
                ▶ Listen to Verse ${v.verse}
              </a>
            </td>
          </tr>
          ` : ''}
          ${!isLast ? `
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 40px; border-left: 1px solid #D4EDDA; border-right: 1px solid #D4EDDA;">
              <hr style="border: none; border-top: 1px dashed #C3E6CB; margin: 16px 0;" />
            </td>
          </tr>
          ` : ''}`;
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quran – Surah ${surahNum} · Verse ${verseNums}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F0FFF4; font-family: 'Georgia', 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0FFF4;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #28A745 0%, #1E7E34 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 2px; text-transform: uppercase;">Daily Verse</p>
              <h1 style="margin: 8px 0 0 0; font-size: 26px; color: #FFFFFF; font-weight: bold;">
                ☪️ The Holy Quran
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 18px; color: rgba(255,255,255,0.95); font-family: 'Traditional Arabic', serif;">
                ${surahName}
              </p>
              <p style="margin: 6px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.8);">
                Surah ${surahNum}: ${transliteration} (${surahMeaning}) · Verse ${verseNums}
              </p>
            </td>
          </tr>

          ${verseBlocksHTML}

          ${buildStreakEmailBlock(streak, '#28A745')}

          <!-- Footer -->
          <tr>
            <td style="background-color: #1A3D1F; padding: 32px 40px; border-radius: 0 0 16px 16px; text-align: center;">
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
}

// ═══════════════════════════════════════════════════════
// BIBLE FORMATTERS (Gospel of John, KJV — NO audio)
// ═══════════════════════════════════════════════════════

function formatBibleWhatsAppMessage(verse, user, streak) {
  let message = `✝️ *Gospel of John – Chapter ${verse.chapter} Verse ${verse.verse}*\n\n`;
  message += `"${verse.text}"\n`;
  message += `\n— _John ${verse.chapter}:${verse.verse}, KJV_`;
  message += buildStreakWhatsApp(streak);
  message += `\n\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📿 _DailyFaith — Your daily spiritual companion_`;
  return message;
}

function formatBibleEmailSubject(verse) {
  return `✝️ Gospel of John – Chapter ${verse.chapter} Verse ${verse.verse} | DailyFaith`;
}

function formatBibleEmailHTML(verse, user, streak) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gospel of John – Chapter ${verse.chapter} Verse ${verse.verse}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F0F4FF; font-family: 'Georgia', 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0F4FF;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4A6FA5 0%, #2E4A7A 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 2px; text-transform: uppercase;">Daily Verse</p>
              <h1 style="margin: 8px 0 0 0; font-size: 26px; color: #FFFFFF; font-weight: bold;">
                ✝️ Gospel of John
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.85);">
                Chapter ${verse.chapter} · Verse ${verse.verse}
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.6);">
                King James Version
              </p>
            </td>
          </tr>

          <!-- Scripture Text -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px; border-left: 1px solid #D0D8E8; border-right: 1px solid #D0D8E8;">
              <div style="background-color: #F5F8FF; border-left: 4px solid #4A6FA5; padding: 28px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 20px; line-height: 1.8; color: #2E4A7A; text-align: center; font-style: italic;">
                  "${verse.text.replace(/\n/g, '<br>')}"
                </p>
              </div>
            </td>
          </tr>

          <!-- Reference -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 0 40px 40px 40px; border-left: 1px solid #D0D8E8; border-right: 1px solid #D0D8E8; text-align: center;">
              <p style="margin: 0; font-size: 15px; color: #4A6FA5; font-weight: bold;">
                — John ${verse.chapter}:${verse.verse}, KJV
              </p>
            </td>
          </tr>

          ${buildStreakEmailBlock(streak, '#4A6FA5')}

          <!-- Footer -->
          <tr>
            <td style="background-color: #1C2E4A; padding: 32px 40px; border-radius: 0 0 16px 16px; text-align: center;">
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
}

module.exports = {
  formatWhatsAppMessage,
  formatEmailHTML,
  formatEmailSubject,
  formatQuranWhatsAppMessage,
  formatQuranEmailHTML,
  formatQuranEmailSubject,
  formatBibleWhatsAppMessage,
  formatBibleEmailHTML,
  formatBibleEmailSubject,
  userGetsAudio,
  getAudioUrl,
  getTranslation
};
