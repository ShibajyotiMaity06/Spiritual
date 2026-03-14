



const twilio = require('twilio');




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





function formatWhatsAppNumber(phoneNumber) {

  let digits = phoneNumber.replace(/[^0-9]/g, '');


  if (digits.length === 10) {
    digits = '91' + digits;
  }

  return `whatsapp:+${digits}`;
}




async function sendWhatsAppMessage(phoneNumber, messageText) {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!client || !fromNumber) {
    console.warn('⚠️ Twilio WhatsApp not configured. Skipping WhatsApp delivery.');
    return { success: false, error: 'Twilio WhatsApp not configured' };
  }

  try {
    const toNumber = formatWhatsAppNumber(phoneNumber);
    const fromWhatsApp = fromNumber.startsWith('whatsapp:') ?
    fromNumber :
    `whatsapp:${fromNumber}`;

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





async function sendWhatsAppAudio(phoneNumber, audioUrl) {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!client || !fromNumber) {
    console.warn('⚠️ Twilio WhatsApp not configured. Skipping audio delivery.');
    return { success: false, error: 'Twilio WhatsApp not configured' };
  }

  try {
    const toNumber = formatWhatsAppNumber(phoneNumber);
    const fromWhatsApp = fromNumber.startsWith('whatsapp:') ?
    fromNumber :
    `whatsapp:${fromNumber}`;

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





async function sendWhatsAppTemplate(phoneNumber, templateName, languageCode = 'en') {


  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!client || !fromNumber) {
    return { success: false, error: 'Twilio WhatsApp not configured' };
  }

  try {
    const toNumber = formatWhatsAppNumber(phoneNumber);
    const fromWhatsApp = fromNumber.startsWith('whatsapp:') ?
    fromNumber :
    `whatsapp:${fromNumber}`;

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