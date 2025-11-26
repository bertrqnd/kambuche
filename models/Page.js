const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    enum: ['about', 'contact', 'intro']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Le contenu est obligatoire'],
    trim: true,
    maxlength: [2000, 'Le contenu ne peut dépasser 2000 caractères'],
    validate: {
      validator: function(value) {
        // Pour la page intro, limiter à 500 caractères
        if (this.slug === 'intro') {
          return value.length <= 500;
        }
        return true;
      },
      message: 'Le texte d\'intro ne peut dépasser 500 caractères'
    }
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

module.exports = mongoose.model('Page', pageSchema);
