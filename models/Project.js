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
    required: true, 
    unique: true 
  },
  date: {
    type: Date,
    default: Date.now
  },
  order: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Project', projectSchema);