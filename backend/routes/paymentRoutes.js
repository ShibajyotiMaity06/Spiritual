



const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPlans
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { validatePlanSelection } = require('../middleware/validate');


router.get('/plans', getPlans);


router.post('/create-order', protect, validatePlanSelection, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;