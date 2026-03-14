



const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const DeliveryLog = require('../models/DeliveryLog');
const { PLAN_FEATURES } = require('../config/constants');
const {
  formatWhatsAppMessage, formatEmailHTML, formatEmailSubject,
  formatQuranWhatsAppMessage, formatQuranEmailHTML, formatQuranEmailSubject,
  formatBibleWhatsAppMessage, formatBibleEmailHTML, formatBibleEmailSubject,
  userGetsAudio, getAudioUrl
} = require('./messageFormatter');
const { sendWhatsAppMessage, sendWhatsAppAudio } = require('./whatsappService');
const { sendVerseEmail } = require('./emailService');




let gitaDataset = null;

function loadDataset() {
  if (gitaDataset) return gitaDataset;

  const dataPath = path.join(__dirname, '..', 'data', 'gita_dataset_v3.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    gitaDataset = JSON.parse(raw);
    console.log(`📖 Loaded Gita dataset: ${gitaDataset.length} verses`);
    return gitaDataset;
  } catch (error) {
    console.error('❌ Failed to load Gita dataset:', error.message);
    return [];
  }
}




let quranDataset = null;

function loadQuranDataset() {
  if (quranDataset) return quranDataset;

  const dataPath = path.join(__dirname, '..', 'data', 'quran-verses.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    quranDataset = JSON.parse(raw);
    console.log(`📖 Loaded Quran dataset: ${quranDataset.length} verses`);
    return quranDataset;
  } catch (error) {
    console.error('❌ Failed to load Quran dataset:', error.message);
    return [];
  }
}




function getVerseByIndex(index) {
  const dataset = loadDataset();
  if (dataset.length === 0) return null;
  return dataset[index % dataset.length];
}










function getQuranVersesByIndex(index) {
  const dataset = loadQuranDataset();
  if (dataset.length === 0) return null;

  const idx = index % dataset.length;
  const first = dataset[idx];
  if (!first) return null;


  const second = dataset[idx + 1] || null;


  if (second && second.surah === first.surah) {
    return { verses: [first, second], advanceBy: 2 };
  }



  return { verses: [first], advanceBy: 1 };
}





let bibleDataset = null;

function loadBibleDataset() {
  if (bibleDataset) return bibleDataset;

  const dataPath = path.join(__dirname, '..', 'data', 'john-kjv-complete.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);

    bibleDataset = [];
    for (const ch of data.chapters) {
      for (const v of ch.verses) {
        bibleDataset.push(v);
      }
    }
    console.log(`📖 Loaded Bible dataset: ${bibleDataset.length} verses (Gospel of John, KJV)`);
    return bibleDataset;
  } catch (error) {
    console.error('❌ Failed to load Bible dataset:', error.message);
    return [];
  }
}




function getBibleVerseByIndex(index) {
  const dataset = loadBibleDataset();
  if (dataset.length === 0) return null;
  return dataset[index % dataset.length];
}




let streakCache = {};

function loadStreakData(book) {
  if (streakCache[book]) return streakCache[book];

  const fileMap = {
    'bhagavad_gita': 'gita_streak.json',
    'quran': 'quran_streak.json',
    'bible': 'bible_streak.json'
  };
  const fileName = fileMap[book];
  if (!fileName) return [];

  const filePath = path.join(__dirname, '..', 'data', fileName);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const key = Object.keys(data)[0];
    streakCache[book] = data[key] || [];
    return streakCache[book];
  } catch (error) {
    console.error(`❌ Failed to load streak data for ${book}:`, error.message);
    return [];
  }
}

function getStreakMessage(book, dayOfMonth) {
  const streaks = loadStreakData(book);
  if (streaks.length === 0) return null;

  const day = (dayOfMonth - 1) % streaks.length + 1;
  const entry = streaks.find((s) => s.day === day);
  return entry ? { day, message: entry.message } : null;
}




function userGetsStreak(user) {
  return ['paid_basic', 'paid_standard', 'paid_premium'].includes(user.subscriptionStatus);
}






function getEffectiveChannel(user) {
  const features = PLAN_FEATURES[user.subscriptionStatus];
  if (!features || features.allowedChannels.length === 0) {
    return null;
  }

  const preferred = user.deliveryChannel || 'email';


  if (preferred === 'whatsapp' && features.allowedChannels.includes('whatsapp') && user.whatsappNumber) {
    return 'whatsapp';
  }


  return 'email';
}




async function deliverVerseToUser(user) {
  try {
    const userBook = user.book || 'bhagavad_gita';
    const isQuran = userBook === 'quran';
    const isBible = userBook === 'bible';


    let verse,quranPair,advanceBy = 1;

    if (isQuran) {
      quranPair = getQuranVersesByIndex(user.currentVerseIndex);
      if (!quranPair) {
        console.log(`⚠️ No Quran verse found for user ${user.email} at index ${user.currentVerseIndex}`);
        return;
      }
      advanceBy = quranPair.advanceBy;
    } else if (isBible) {
      verse = getBibleVerseByIndex(user.currentVerseIndex);
      if (!verse) {
        console.log(`⚠️ No Bible verse found for user ${user.email} at index ${user.currentVerseIndex}`);
        return;
      }
    } else {
      verse = getVerseByIndex(user.currentVerseIndex);
      if (!verse) {
        console.log(`⚠️ No verse found for user ${user.email} at index ${user.currentVerseIndex}`);
        return;
      }
    }


    const streak = userGetsStreak(user) ? getStreakMessage(userBook, new Date().getDate()) : null;

    const channel = getEffectiveChannel(user);
    if (!channel) {
      console.log(`⚠️ No delivery channel for user ${user.email} (status: ${user.subscriptionStatus})`);
      return;
    }

    const results = { whatsapp: null, email: null };
    const includeAudio = userGetsAudio(user);


    if (channel === 'whatsapp' && user.whatsappNumber) {
      let whatsappText;
      if (isQuran) {
        whatsappText = formatQuranWhatsAppMessage(quranPair.verses, user, streak);
      } else if (isBible) {
        whatsappText = formatBibleWhatsAppMessage(verse, user, streak);
      } else {
        whatsappText = formatWhatsAppMessage(verse, user, streak);
      }
      results.whatsapp = await sendWhatsAppMessage(user.whatsappNumber, whatsappText);


      await DeliveryLog.create({
        userId: user._id,
        verseId: null,
        deliveryMethod: 'whatsapp_freeform',
        status: results.whatsapp.success ? 'sent' : 'failed',
        cost: 0,
        whatsappMessageId: results.whatsapp.messageId || null,
        timestamp: new Date()
      });


      if (includeAudio && !isQuran && !isBible) {
        const audioUrl = getAudioUrl(verse.id, user.language);
        await sendWhatsAppAudio(user.whatsappNumber, audioUrl);
      }
    } else {

      let subject, html;
      if (isQuran) {
        subject = formatQuranEmailSubject(quranPair.verses);
        html = formatQuranEmailHTML(quranPair.verses, user, streak);
      } else if (isBible) {
        subject = formatBibleEmailSubject(verse);
        html = formatBibleEmailHTML(verse, user, streak);
      } else {
        subject = formatEmailSubject(verse);
        html = formatEmailHTML(verse, user, streak);
      }
      results.email = await sendVerseEmail(user.email, subject, html);


      await DeliveryLog.create({
        userId: user._id,
        verseId: null,
        deliveryMethod: 'email',
        status: results.email.success ? 'sent' : 'failed',
        cost: 0.01,
        emailMessageId: results.email.messageId || null,
        timestamp: new Date()
      });
    }


    const updateQuery = {
      $inc: { currentVerseIndex: advanceBy, totalVersesReceived: advanceBy, streakCount: 1 },
      lastVerseDeliveredAt: new Date(),
      lastActivityAt: new Date()
    };


    if (user.streakCount + 1 > user.longestStreak) {
      updateQuery.longestStreak = user.streakCount + 1;
    }

    await User.findByIdAndUpdate(user._id, updateQuery);

    const ok = channel === 'whatsapp' ? results.whatsapp?.success : results.email?.success;
    if (isQuran) {
      const vIds = quranPair.verses.map((v) => `${v.surah}:${v.verse}`).join(', ');
      console.log(`📨 Delivered Quran ${vIds} to ${user.name} via ${channel.toUpperCase()} (${ok ? '✅' : '❌'})`);
    } else if (isBible) {
      console.log(`📨 Delivered John ${verse.chapter}:${verse.verse} to ${user.name} via ${channel.toUpperCase()} (${ok ? '✅' : '❌'})`);
    } else {
      console.log(`📨 Delivered Gita Ch.${verse.chapter}:${verse.verse} to ${user.name} via ${channel.toUpperCase()} (${ok ? '✅' : '❌'})`);
    }

    return results;
  } catch (error) {
    console.error(`❌ Delivery failed for user ${user.email}:`, error.message);
  }
}




async function expireTrials() {
  try {
    const result = await User.updateMany(
      {
        subscriptionStatus: 'trial',
        trialExpiry: { $lt: new Date() }
      },
      {
        $set: { subscriptionStatus: 'expired' }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ Expired ${result.modifiedCount} trial user(s)`);
    }
  } catch (error) {
    console.error('❌ Trial expiry check failed:', error.message);
  }
}




async function expireSubscriptions() {
  try {
    const result = await User.updateMany(
      {
        subscriptionStatus: { $in: ['paid_basic', 'paid_standard', 'paid_premium'] },
        subscriptionExpiry: { $lt: new Date() }
      },
      {
        $set: { subscriptionStatus: 'expired' }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ Expired ${result.modifiedCount} paid subscription(s)`);
    }
  } catch (error) {
    console.error('❌ Subscription expiry check failed:', error.message);
  }
}




async function processScheduledDeliveries() {
  try {

    await expireTrials();
    await expireSubscriptions();



    const now = new Date();

    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const currentHour = istTime.getUTCHours();

    console.log(`\n⏰ Running scheduled delivery check — UTC: ${now.getUTCHours()}:00, IST hour: ${currentHour}:00`);



    const users = await User.find({
      isActive: true,
      preferredTime: currentHour,
      subscriptionStatus: { $in: ['trial', 'paid_basic', 'paid_standard', 'paid_premium'] },

      $or: [

      { subscriptionStatus: 'trial', trialExpiry: { $gt: new Date() } },

      {
        subscriptionStatus: { $in: ['paid_basic', 'paid_standard', 'paid_premium'] },
        $or: [
        { subscriptionExpiry: null },
        { subscriptionExpiry: { $gt: new Date() } }]

      }]

    });

    if (users.length === 0) {
      console.log('📭 No users scheduled for delivery at this hour.');
      return;
    }

    console.log(`📬 Found ${users.length} users scheduled for hour ${currentHour}`);


    const BATCH_SIZE = 10;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((user) => deliverVerseToUser(user)));


      if (i + BATCH_SIZE < users.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`✅ Scheduled delivery complete. Processed ${users.length} users.\n`);
  } catch (error) {
    console.error('❌ Scheduled delivery error:', error.message);
  }
}





async function deliverVerseOnDemand(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  return deliverVerseToUser(user);
}





function startScheduler() {

  cron.schedule('0 * * * *', () => {
    console.log('🕐 Cron triggered: checking for scheduled deliveries...');
    processScheduledDeliveries();
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('🗓️  Verse delivery scheduler started (runs every hour)');
}

module.exports = {
  startScheduler,
  deliverVerseToUser,
  deliverVerseOnDemand,
  processScheduledDeliveries,
  getVerseByIndex,
  getQuranVersesByIndex,
  getBibleVerseByIndex,
  loadDataset,
  loadQuranDataset,
  loadBibleDataset,
  getEffectiveChannel,
  getStreakMessage,
  userGetsStreak
};