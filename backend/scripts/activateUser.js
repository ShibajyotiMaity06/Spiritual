// ═══════════════════════════════════════════════════════
// scripts/activateUser.js — Manually activate a paid user
// Usage: node scripts/activateUser.js <email>
// ═══════════════════════════════════════════════════════

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const PAYMENTS_FILE = path.join(__dirname, '..', '..', 'payments.json');

async function activateUser(email) {
    if (!email) {
        console.error('❌ Usage: node scripts/activateUser.js <email>');
        process.exit(1);
    }

    email = email.toLowerCase().trim();
    console.log(`\n🔍 Looking up user: ${email}\n`);

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.error(`❌ No user found with email: ${email}`);
            process.exit(1);
        }

        console.log(`📋 User found:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Plan: ${user.subscriptionStatus}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Delivery: ${user.deliveryChannel} at ${user.preferredTime}:00`);
        console.log(`   Subscription Expiry: ${user.subscriptionExpiry}`);

        if (user.isActive) {
            console.log(`\n⚠️  User is already active! No action needed.`);
            process.exit(0);
        }

        // Activate user
        user.isActive = true;
        user.lastActivityAt = new Date();
        await user.save();
        console.log(`\n✅ User activated! ${user.name} (${email}) is now ACTIVE.`);
        console.log(`   They will start receiving verses at ${user.preferredTime}:00 IST daily.`);

        // Update payments.json — mark as verified
        try {
            const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
            const fileData = JSON.parse(raw);
            const payment = fileData.payments.find(
                p => p.email.toLowerCase() === email && !p.verified
            );
            if (payment) {
                payment.verified = true;
                payment.activatedAt = new Date().toISOString();
                payment.notes = 'Manually activated via script';
                fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(fileData, null, 2), 'utf-8');
                console.log(`✅ payments.json updated — marked as verified.`);
            }
        } catch (e) {
            console.warn(`⚠️  Could not update payments.json:`, e.message);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB.\n');
    }
}

// Run with email from CLI argument
activateUser(process.argv[2]);
