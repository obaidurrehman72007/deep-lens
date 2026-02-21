const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required:false },
  youtubeUrl: { type: String, required: true },
  videoId: { type: String, required: true }, // extracted from URL
  thumbnail: { type: String },
  summary: { type: String }, // The text summary from ChatGPT
  canvasId: { type: mongoose.Schema.Types.ObjectId, ref: 'Canvas' },
  createdAt: { type: Date, default: Date.now },
  shareToken: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model('Video', videoSchema);