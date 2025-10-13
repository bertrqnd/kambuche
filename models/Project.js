const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
title: { type: String, required: true },
description: { type: String, required: true },
image_url: { type: String },
slug: { type: String, required: true, unique: true },
date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Project', projectSchema);