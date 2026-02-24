const mongoose = require('mongoose');

const SharedLinkSchema = new mongoose.Schema({
  videoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Video', 
    required: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  settings: {
    canEdit: { type: Boolean, default: false }, // Future proofing
    expiresAt: { type: Date }
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: { expires: '30d' } // Automatically deletes after 30 days
  }
});

module.exports = mongoose.model('SharedLink', SharedLinkSchema);