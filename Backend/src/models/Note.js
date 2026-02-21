const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorEmail: { type: String }, // Stores the email of the person who made it
  text: { type: String, required: true },
  time: { type: String },
  rawTime: { type: Number },
  lastEditedBy: { type: String }, // Stores email of the person who edited it
  createdAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);