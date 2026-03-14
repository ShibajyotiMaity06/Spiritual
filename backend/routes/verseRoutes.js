



const express = require('express');
const router = express.Router();
const {
  getVerses,
  getVerseById,
  getTodayVerse,
  getRandomVerse,
  createVerse,
  updateVerse,
  deleteVerse,
  getChapters
} = require('../controllers/verseController');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');
const { validateVerseQuery } = require('../middleware/validate');


router.get('/', validateVerseQuery, getVerses);
router.get('/random', validateVerseQuery, getRandomVerse);
router.get('/chapters', getChapters);


router.get('/today', protect, getTodayVerse);
router.get('/:id', getVerseById);


router.post('/', protect, adminOnly, createVerse);
router.put('/:id', protect, adminOnly, updateVerse);
router.delete('/:id', protect, adminOnly, deleteVerse);

module.exports = router;