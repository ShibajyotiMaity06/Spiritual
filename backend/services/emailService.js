// ═══════════════════════════════════════════════════════
// services/emailService.js — Email Delivery via Resend
// ═══════════════════════════════════════════════════════

const { Resend } = require('resend');

// ─────────────────────────────────────────────────────
// Create Resend client (lazy-initialized)
// ─────────────────────────────────────────────────────
let resendClient = null;

function getResendClient() {
    if (resendClient) return resendClient;

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ RESEND_API_KEY not configured. Email delivery disabled.');
        return null;
    }

    resendClient = new Resend(apiKey);
    return resendClient;
}

// ─────────────────────────────────────────────────────
// Send verse email via Resend
// ─────────────────────────────────────────────────────
async function sendVerseEmail(toEmail, subject, htmlContent) {
    const client = getResendClient();

    if (!client) {
        return {
            success: false,
            error: 'Resend API not configured'
        };
    }

    const fromEmail = process.env.FROM_EMAIL || 'DailyFaith <noreply@dailyfaith.in>';

    try {
        const { data, error } = await client.emails.send({
            from: fromEmail,
            to: [toEmail],
            subject,
            html: htmlContent,
            // Plain text fallback
            text: htmlContent
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, '')
                .replace(/\s+/g, ' ')
                .trim()
        });

        if (error) {
            console.error(`❌ Email send failed to ${toEmail}:`, error.message || error);
            return {
                success: false,
                error: error.message || JSON.stringify(error)
            };
        }

        console.log(`✅ Email sent to ${toEmail} | ID: ${data.id}`);

        return {
            success: true,
            messageId: data.id
        };
    } catch (error) {
        console.error(`❌ Email send failed to ${toEmail}:`, error.message);

        return {
            success: false,
            error: error.message
        };
    }
}

// ─────────────────────────────────────────────────────
// Verify Resend connection (useful for health checks)
// ─────────────────────────────────────────────────────
async function verifyEmailConnection() {
    const client = getResendClient();
    if (!client) return false;

    try {
        // Resend doesn't have a verify method, just check if API key is set
        console.log('✅ Resend API key configured');
        return true;
    } catch (error) {
        console.error('❌ Resend connection failed:', error.message);
        return false;
    }
}

module.exports = {
    sendVerseEmail,
    verifyEmailConnection
};
