



const { Resend } = require('resend');




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




async function sendVerseEmail(toEmail, subject, htmlContent) {
  const client = getResendClient();

  if (!client) {
    return {
      success: false,
      error: 'Resend API not configured'
    };
  }

  const rawFrom = process.env.FROM_EMAIL || 'noreply@spiritmsg.in';

  const fromEmail = rawFrom.includes('<') ? rawFrom : `DailyFaith <${rawFrom}>`;

  console.log(`📧 Sending email from: ${fromEmail} → to: ${toEmail}`);

  try {
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html: htmlContent,

      text: htmlContent.
      replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').
      replace(/<[^>]+>/g, '').
      replace(/\s+/g, ' ').
      trim()
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




async function verifyEmailConnection() {
  const client = getResendClient();
  if (!client) return false;

  try {

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