



const express = require('express');
const router = express.Router();
const {
  getOverview,
  getSignupTrends,
  getDeliveryStats,
  getRevenueStats,
  getAllUsers
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');


router.use(protect, adminOnly);

router.get('/overview', getOverview);
router.get('/signups', getSignupTrends);
router.get('/delivery', getDeliveryStats);
router.get('/revenue', getRevenueStats);
router.get('/users', getAllUsers);

module.exports = router;