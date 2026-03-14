



const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { startScheduler } = require('./services/schedulerService');


dotenv.config();


connectDB();

const app = express();




app.use(helmet());

const allowedOrigins = [
'http://localhost:5173',
'http://localhost:3000',
...(process.env.CLIENT_URL?.split(",") || [])];


app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use('/api', apiLimiter);


app.use('/audio', (req, res, next) => {

  if (req.path.includes('_tamil')) {
    return res.status(404).json({ success: false, message: 'Audio not available' });
  }
  next();
}, express.static(path.join(__dirname, 'data', 'audio')));



app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🙏 DailyFaith API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});


app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});



app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/verses', require('./routes/verseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/subscribe', require('./routes/subscribeRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});



app.use(errorHandler);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 DailyFaith server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Audio: http://localhost:${PORT}/audio/`);


  startScheduler();
  console.log('');
});

module.exports = app;