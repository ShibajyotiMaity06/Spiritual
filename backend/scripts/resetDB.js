// ═══════════════════════════════════════════════════════
// scripts/resetDB.js — Reset entire database for fresh testing
// Usage: node scripts/resetDB.js
// ⚠️  THIS DELETES ALL USERS AND DELIVERY LOGS!
// ═══════════════════════════════════════════════════════

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const DeliveryLog = require('../models/DeliveryLog');

const PAYMENTS_FILE = path.join(__dirname, '..', '..', 'payments.json');
const SUBSCRIPTIONS_FILE = path.join(__dirname, '..', '..', 'subscriptions.json');

async function resetDB() {
    console.log('\n🔴 DATABASE RESET SCRIPT');
    console.log('========================\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Count before delete
        const userCount = await User.countDocuments();
        const logCount = await DeliveryLog.countDocuments();
        console.log(`\n📊 Current counts:`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Delivery Logs: ${logCount}`);

        // Delete all users
        const userResult = await User.deleteMany({});
        console.log(`\n🗑️  Deleted ${userResult.deletedCount} users`);

        // Delete all delivery logs
        const logResult = await DeliveryLog.deleteMany({});
        console.log(`🗑️  Deleted ${logResult.deletedCount} delivery logs`);

        // Reset payments.json
        try {
            fs.writeFileSync(PAYMENTS_FILE, JSON.stringify({ payments: [] }, null, 2), 'utf-8');
            console.log(`🗑️  Reset payments.json`);
        } catch (e) {
            console.warn(`⚠️  Could not reset payments.json:`, e.message);
        }

        // Reset subscriptions.json
        try {
            fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify({ subscribers: [] }, null, 2), 'utf-8');
            console.log(`🗑️  Reset subscriptions.json`);
        } catch (e) {
            console.warn(`⚠️  Could not reset subscriptions.json:`, e.message);
        }

        console.log('\n✅ Database fully reset! Ready for fresh testing.\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.\n');
    }
}

resetDB();
