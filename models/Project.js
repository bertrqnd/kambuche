const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
title: { type: String, required: true },
description: { type: String, required: true },
cover_image_url: { type: String },
images_url: { type: [String], default: [] },
slug: { type: String, required: true, unique: true },
date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Project', projectSchema);