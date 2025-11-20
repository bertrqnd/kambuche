const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  short_description: { 
    type: String, 
    required: true 
  },
  usage: { 
    type: String 
  },
  surface: { 
    type: String 
  },
  location_year: { 
    type: String 
  },
  description: { 
    type: String, 
    required: true 
  },
  cover_image_url: { 
    type: String 
  },
  images_url: { 
    type: [String], 
    default: [] 
  },
  slug: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  order: {
    type: Number,
    default: 0
  },
  language: {
    type: String,
    required: true,
    enum: ['fr', 'en', 'es'],
    default: 'fr'
  }
});

// Index composé pour garantir l'unicité de slug + language
projectSchema.index({ slug: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);