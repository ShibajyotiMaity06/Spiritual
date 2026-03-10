// ═══════════════════════════════════════════════════════
// services/whatsappService.js — WhatsApp via Twilio
// ═══════════════════════════════════════════════════════

const twilio = require('twilio');

// ─────────────────────────────────────────────────────
// Create Twilio client (lazy-initialized)
// ─────────────────────────────────────────────────────
let twilioClient = null;

function getTwilioClient() {
    if (twilioClient) return twilioClient;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.warn('⚠️ Twilio credentials not configured. WhatsApp delivery disabled.');
        return null;
    }

    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
}

// ─────────────────────────────────────────────────────
// Format phone number for Twilio WhatsApp
// Ensures +91 prefix for Indian numbers
// ─────────────────────────────────────────────────────
function formatWhatsAppNumber(phoneNumber) {
    // Strip all non-digits
    let digits = phoneNumber.replace(/[^0-9]/g, '');

    // If it's a 10-digit Indian number, add 91 prefix
    if (digits.length === 10) {
        digits = '91' + digits;
    }

    return `whatsapp:+${digits}`;
}

// ─────────────────────────────────────────────────────
// Send a text message via Twilio WhatsApp
// ─────────────────────────────────────────────────────
async function sendWhatsAppMessage(phoneNumber, messageText) {
    const client = getTwilioClient();
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!client || !fromNumber) {
        console.warn('⚠️ Twilio WhatsApp not configured. Skipping WhatsApp delivery.');
        return { success: false, error: 'Twilio WhatsApp not configured' };
    }

    try {
        const toNumber = formatWhatsAppNumber(phoneNumber);
        const fromWhatsApp = fromNumber.startsWith('whatsapp:')
            ? fromNumber
            : `whatsapp:${fromNumber}`;

        const message = await client.messages.create({
            body: messageText,
            from: fromWhatsApp,
            to: toNumber
        });

        console.log(`✅ WhatsApp message sent to ${toNumber} | SID: ${message.sid}`);

        return {
            success: true,
            messageId: message.sid,
            status: message.status || 'sent'
        };
    } catch (error) {
        console.error(`❌ WhatsApp send failed to ${phoneNumber}:`, error.message);

        return {
            success: false,
            error: error.message,
            statusCode: error.status
        };
    }
}

// ─────────────────────────────────────────────────────
// Send an audio message via Twilio WhatsApp
// (For premium users — sends audio via media URL)
// ─────────────────────────────────────────────────────
async function sendWhatsAppAudio(phoneNumber, audioUrl) {
    const client = getTwilioClient();
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!client || !fromNumber) {
        console.warn('⚠️ Twilio WhatsApp not configured. Skipping audio delivery.');
        return { success: false, error: 'Twilio WhatsApp not configured' };
    }

    try {
        const toNumber = formatWhatsAppNumber(phoneNumber);
        const fromWhatsApp = fromNumber.startsWith('whatsapp:')
            ? fromNumber
            : `whatsapp:${fromNumber}`;

        const message = await client.messages.create({
            body: '🔊 Listen to the verse chanting:',
            mediaUrl: [audioUrl],
            from: fromWhatsApp,
            to: toNumber
        });

        console.log(`✅ WhatsApp audio sent to ${toNumber} | SID: ${message.sid}`);

        return {
            success: true,
            messageId: message.sid,
            status: 'sent'
        };
    } catch (error) {
        console.error(`❌ WhatsApp audio send failed to ${phoneNumber}:`, error.message);

        return {
            success: false,
            error: error.message
        };
    }
}

// ─────────────────────────────────────────────────────
// Send a template message (for re-engagement / opt-in)
// Twilio uses content templates — simplified version
// ─────────────────────────────────────────────────────
async function sendWhatsAppTemplate(phoneNumber, templateName, languageCode = 'en') {
    // For Twilio, template messages work via pre-approved content SIDs
    // For now, send as regular message; configure content templates in Twilio Console
    const client = getTwilioClient();
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!client || !fromNumber) {
        return { success: false, error: 'Twilio WhatsApp not configured' };
    }

    try {
        const toNumber = formatWhatsAppNumber(phoneNumber);
        const fromWhatsApp = fromNumber.startsWith('whatsapp:')
            ? fromNumber
            : `whatsapp:${fromNumber}`;

        const message = await client.messages.create({
            body: `Hello from DailyFaith! 🙏 Your daily spiritual companion is here. Reply with any message to get today's verse.`,
            from: fromWhatsApp,
            to: toNumber
        });

        console.log(`✅ WhatsApp template "${templateName}" sent to ${toNumber}`);

        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error(`❌ WhatsApp template send failed:`, error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppAudio,
    sendWhatsAppTemplate
};
