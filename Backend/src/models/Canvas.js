const mongoose = require('mongoose');

const canvasSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  elements: { type: Array, default: [] }, // Use Array to allow flexible drawing objects
  camera: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Canvas', canvasSchema);