



const mongoose = require('mongoose');

const verseSchema = new mongoose.Schema({

  religion: {
    type: String,
    enum: ['hindu', 'muslim', 'christian'],
    required: true
  },
  book: {
    type: String,
    required: true

  },
  chapter: { type: Number, required: true },
  verseNumber: { type: Number, required: true },


  originalText: { type: String, required: true },
  transliteration: { type: String },


  translations: {
    hindi: {
      text: String,
      meaning: String,
      commentary: String
    },
    english: {
      text: String,
      meaning: String,
      commentary: String
    },
    tamil: {
      text: String,
      meaning: String,
      commentary: String
    },
    telugu: {
      text: String,
      meaning: String,
      commentary: String
    },
    malayalam: {
      text: String,
      meaning: String,
      commentary: String
    },
    kannada: {
      text: String,
      meaning: String,
      commentary: String
    },
    urdu: {
      text: String,
      meaning: String,
      commentary: String
    }
  },


  audioUrls: {
    hindi: String,
    english: String,
    tamil: String,
    telugu: String,
    malayalam: String,
    kannada: String,
    urdu: String
  },
  imageUrl: String,


  tags: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },


  deliveredCount: { type: Number, default: 0 },
  sharedCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});


verseSchema.index({ religion: 1, book: 1, chapter: 1, verseNumber: 1 }, { unique: true });

module.exports = mongoose.model('Verse', verseSchema);