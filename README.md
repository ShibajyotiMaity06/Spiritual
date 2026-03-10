# 🙏 DailyFaith — Daily Spiritual Verses Delivered to Your Inbox

> Receive daily verses from the **Bhagavad Gita**, **Quran**, or **Bible** in your preferred language — via **Email** or **WhatsApp** — at a time you choose.

---

## 📌 Overview

DailyFaith is a spiritual SaaS application that delivers daily scripture (verses + translations + audio) from the Bhagavad Gita, Quran, and Bible in multiple Indian languages. The goal is to make scripture accessible, consistent, and beautiful for millions of users.

### Target Users

- Religious Indians aged 25–55
- Indian diaspora (US, UK, Middle East)
- Parents wanting to teach kids their scripture
- Spiritual seekers wanting daily discipline

---

## ✨ Features

| Feature | Free (₹0) | Basic (₹49/mo) | Standard (₹99/mo) | Premium (₹149/mo) | Yearly (₹1,599/yr) |
|---|---|---|---|---|---|
| Daily verse via Email | ✅ (3 days) | ✅ | ✅ | ✅ | ✅ |
| Auto-delivery at chosen time | ✅ | ✅ | ✅ | ✅ | ✅ |
| WhatsApp delivery | ❌ | ✅ | ✅ | ✅ | ✅ |
| Multi-language support | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audio verses | ❌ | ❌ | ✅ | ✅ | ✅ |
| Weekend reflections | ❌ | ❌ | ❌ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ❌ | ✅ | ✅ |

### Supported Books
- 🕉️ **Bhagavad Gita** — 18 chapters, 700 verses
- ☪️ **Quran** — 114 Surah's and 6236 Verses
- ✝️ **Bible** — Coming soon

### Supported Languages
Hindi, English, Tamil (more coming soon: Telugu, Malayalam, Kannada, Urdu)

---

## 🏗️ Tech Stack

### Frontend
- **React 19** with Vite 7
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Router 7** for routing

### Backend
- **Express 5** (Node.js)
- **MongoDB Atlas** with Mongoose 9
- **Resend** for transactional email delivery
- **Twilio** for WhatsApp delivery
- **node-cron** for scheduled verse delivery
- **Helmet + Rate Limiting** for security

### Payment
- Manual **UPI verification** (QR code + UPI ID shown in-app)
- Razorpay integration planned for future

---

## 📁 Project Structure

```
Spiritual/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── PricingSection.jsx
│   │   │   ├── SubscribeModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ...
│   │   ├── pages/              # Route pages
│   │   │   ├── GenericLanding.jsx
│   │   │   ├── HinduLanding.jsx
│   │   │   ├── QuranLanding.jsx
│   │   │   ├── BibleLanding.jsx
│   │   │   └── ...
│   │   └── App.jsx
│   └── public/
│       └── upi-qr.jpg          # UPI QR code for payments
│
├── backend/                    # Express API server
│   ├── controllers/
│   │   ├── subscribeController.js   # Subscription & payment handling
│   │   ├── authController.js        # Authentication
│   │   └── ...
│   ├── models/
│   │   └── User.js                  # Mongoose user schema
│   ├── services/
│   │   ├── schedulerService.js      # Cron-based verse delivery
│   │   ├── emailService.js          # Resend email integration
│   │   └── whatsappService.js       # Twilio WhatsApp integration
│   ├── routes/
│   ├── middleware/
│   ├── .env                         # Environment variables
│   └── server.js                    # Entry point
│
├── audio/                      # Pre-generated MP3 audio files
│   ├── 1.1_english.mp3
│   ├── 1.1_hindi.mp3
│   └── ...
│
├── gita_dataset_v3.json        # Bhagavad Gita verses dataset
├── subscriptions.json          # Subscriber tracking (manual)
├── payments.json               # Payment claims for verification
└── prd.txt                     # Product Requirements Document
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **MongoDB Atlas** account (or local MongoDB)
- **Resend** account with verified domain
- (Optional) **Twilio** account for WhatsApp delivery

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/spiritual.git
cd spiritual
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/spiritual
JWT_SECRET=your_jwt_secret

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=your-verified-email@yourdomain.com

# Twilio (WhatsApp) — Optional
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=xxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

### 4. Add UPI QR Code (for paid plans)

Place your UPI QR code image at:

```
frontend/public/upi-qr.jpg
```

---

## 🔄 How It Works

### Subscription Flow

1. **User visits** a religion-specific landing page (e.g., `/gita`)
2. **Selects a plan** from the pricing section
3. **Fills in details** — name, email, language, preferred delivery time, channel (email/WhatsApp)
4. **Free Trial** → First verse sent immediately; scheduler handles days 2–3
5. **Paid Plans** → UPI QR code shown; user enters "paid by" name; payment logged to `payments.json` for manual verification
6. **Admin verifies** payment and activates user in MongoDB (`isActive: true`)
7. **Scheduler** (cron job) runs every hour, delivers verses to active users at their preferred time

### Verse Delivery

- **Email**: Beautiful HTML templates via Resend with Sanskrit/original text + translation + commentary
- **WhatsApp**: Formatted messages via Twilio (for paid plans)
- **Audio**: Pre-generated MP3 files in Hindi, English, and Tamil

### Scheduler Details

- Runs every hour at minute `:00` in `Asia/Kolkata` timezone
- Finds all active users whose `preferredTime` matches the current IST hour
- Delivers the next verse in sequence based on user's `currentVerseIndex`
- Tracks delivery with `lastVerseDeliveredAt` and `totalVersesReceived`

---

## 💳 Payment Flow (Manual UPI)

1. User selects a paid plan and fills in details
2. Modal shows UPI QR code + UPI ID (`shibajyotimaity06@okicici`)
3. User pays via any UPI app (GPay, PhonePe, Paytm, etc.)
4. User enters the name used for payment and submits
5. Payment claim is logged to `payments.json`
6. Admin manually verifies the UPI transaction
7. Admin sets `isActive: true` in MongoDB for the user
8. User starts receiving verses at their chosen time (within 4 hours)

---

## 📊 Data Files

| File | Purpose |
|---|---|
| `gita_dataset_v3.json` | Complete Bhagavad Gita dataset with verses, translations, and commentary |
| `subscriptions.json` | All subscriber records for tracking |
| `payments.json` | Payment claims from paid users for manual verification |

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/subscribe` | Subscribe to a plan (free or paid) |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/me` | Get current user profile |

---

## 🛣️ Roadmap

- [ ] Razorpay payment gateway integration
- [ ] Quran and Bible datasets
- [ ] More languages (Telugu, Malayalam, Kannada, Urdu)
- [ ] User dashboard with streak counter & gamification
- [ ] Chapter-wise deep dives (weekly)
- [ ] PDF downloads of full chapters
- [ ] Admin panel for subscriber management & payment verification
- [ ] Push notifications
- [ ] Multi-book subscriptions

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 🙏 Credits

Built with love for spiritual seekers everywhere.

**DailyFaith** — *Your daily dose of divine wisdom.*