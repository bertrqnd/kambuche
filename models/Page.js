const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    enum: ['about', 'contact']
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
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Page', pageSchema);
