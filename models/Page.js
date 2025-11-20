const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    enum: ['about', 'contact']
  },
  language: {
    type: String,
    required: true,
    enum: ['fr', 'en', 'es'],
    default: 'fr'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // Champs spécifiques pour la page Contact
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  // Champ spécifique pour la page À propos
  image_url: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour garantir l'unicité de slug + language
pageSchema.index({ slug: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('Page', pageSchema);
