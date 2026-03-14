



const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getDashboard,
  changeLanguage,
  changeDeliveryTime,
  deactivateAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');


router.use(protect);

router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.put('/language', changeLanguage);
router.put('/delivery-time', changeDeliveryTime);
router.delete('/account', deactivateAccount);

module.exports = router;