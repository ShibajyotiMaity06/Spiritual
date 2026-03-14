



const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/subscribeController');
const { authLimiter } = require('../middleware/rateLimiter');


router.post('/', authLimiter, subscribe);

module.exports = router;