// ═══════════════════════════════════════════════════════
// models/Verse.js
// ═══════════════════════════════════════════════════════

const verseSchema = new mongoose.Schema({
  // Source Info
  religion: { 
    type: String, 
    enum: ['hindu', 'muslim', 'christian'], 
    required: true 
  },
  book: { 
    type: String, 
    required: true 
    // Examples: 'bhagavad_gita', 'quran', 'new_testament', 'old_testament'
  },
  chapter: { type: Number, required: true },
  verseNumber: { type: Number, required: true },
  
  // Original Text
  originalText: { type: String, required: true },
  transliteration: { type: String }, // For Sanskrit/Arabic
  
  // Translations (Multi-language support)
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
  
  // Media
  audioUrls: {
    hindi: String,
    english: String,
    tamil: String,
    telugu: String,
    malayalam: String,
    kannada: String,
    urdu: String
  },
  imageUrl: String, // Shareable card image (Canva-generated)
  
  // Metadata
  tags: [String], // e.g., ['karma', 'duty', 'action']
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Stats
  deliveredCount: { type: Number, default: 0 },
  sharedCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

// Compound index for unique verses
verseSchema.index({ religion: 1, book: 1, chapter: 1, verseNumber: 1 }, { unique: true });

module.exports = mongoose.model('Verse', verseSchema);