



const Verse = require('../models/Verse');
const User = require('../models/User');
const DeliveryLog = require('../models/DeliveryLog');
const { RELIGIONS, LANGUAGES } = require('../config/constants');




const getVerses = async (req, res, next) => {
  try {
    const {
      religion,
      language,
      book,
      chapter,
      difficulty,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    if (religion) filter.religion = religion;
    if (book) filter.book = book;
    if (chapter) filter.chapter = Number(chapter);
    if (difficulty) filter.difficulty = difficulty;

    const skip = (Number(page) - 1) * Number(limit);

    const [verses, total] = await Promise.all([
    Verse.find(filter).
    sort({ chapter: 1, verseNumber: 1 }).
    skip(skip).
    limit(Number(limit)).
    lean(),
    Verse.countDocuments(filter)]
    );


    let data = verses;
    if (language && LANGUAGES.includes(language)) {
      data = verses.map((v) => ({
        ...v,
        translation: v.translations?.[language] || null,
        audioUrl: v.audioUrls?.[language] || null,

        translations: undefined,
        audioUrls: undefined
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        verses: data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};




const getVerseById = async (req, res, next) => {
  try {
    const verse = await Verse.findById(req.params.id).lean();

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'Verse not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { verse }
    });
  } catch (error) {
    next(error);
  }
};




const getTodayVerse = async (req, res, next) => {
  try {
    const user = req.user;


    const verse = await Verse.findOne({ religion: user.religion }).
    sort({ chapter: 1, verseNumber: 1 }).
    skip(user.currentVerseIndex).
    lean();

    if (!verse) {
      return res.status(200).json({
        success: true,
        message: 'You have completed all available verses! Restarting from the beginning.',
        data: { verse: null, completed: true }
      });
    }


    const lang = user.language || 'english';
    const response = {
      id: verse._id,
      religion: verse.religion,
      book: verse.book,
      chapter: verse.chapter,
      verseNumber: verse.verseNumber,
      originalText: verse.originalText,
      transliteration: verse.transliteration,
      translation: verse.translations?.[lang] || verse.translations?.english || null,
      audioUrl: verse.audioUrls?.[lang] || null,
      imageUrl: verse.imageUrl,
      tags: verse.tags,
      difficulty: verse.difficulty
    };

    res.status(200).json({
      success: true,
      data: { verse: response }
    });
  } catch (error) {
    next(error);
  }
};




const getRandomVerse = async (req, res, next) => {
  try {
    const { religion, language } = req.query;

    const filter = {};
    if (religion && RELIGIONS.includes(religion)) filter.religion = religion;

    const count = await Verse.countDocuments(filter);
    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: 'No verses found for this filter'
      });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const verse = await Verse.findOne(filter).skip(randomIndex).lean();

    let data = verse;
    if (language && LANGUAGES.includes(language)) {
      data = {
        ...verse,
        translation: verse.translations?.[language] || null,
        audioUrl: verse.audioUrls?.[language] || null,
        translations: undefined,
        audioUrls: undefined
      };
    }

    res.status(200).json({
      success: true,
      data: { verse: data }
    });
  } catch (error) {
    next(error);
  }
};




const createVerse = async (req, res, next) => {
  try {
    const verse = await Verse.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Verse created successfully',
      data: { verse }
    });
  } catch (error) {
    next(error);
  }
};




const updateVerse = async (req, res, next) => {
  try {
    const verse = await Verse.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'Verse not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verse updated successfully',
      data: { verse }
    });
  } catch (error) {
    next(error);
  }
};




const deleteVerse = async (req, res, next) => {
  try {
    const verse = await Verse.findByIdAndDelete(req.params.id);

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'Verse not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verse deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};




const getChapters = async (req, res, next) => {
  try {
    const { religion, book } = req.query;

    const filter = {};
    if (religion) filter.religion = religion;
    if (book) filter.book = book;

    const chapters = await Verse.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { book: '$book', chapter: '$chapter' },
        verseCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.book': 1, '_id.chapter': 1 } }]
    );

    const result = chapters.map((c) => ({
      book: c._id.book,
      chapter: c._id.chapter,
      verseCount: c.verseCount
    }));

    res.status(200).json({
      success: true,
      data: { chapters: result }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVerses,
  getVerseById,
  getTodayVerse,
  getRandomVerse,
  createVerse,
  updateVerse,
  deleteVerse,
  getChapters
};