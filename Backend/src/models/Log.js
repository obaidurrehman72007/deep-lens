const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  // The ID of the video/canvas session
  videoId: { 
    type: String, 
    required: true,
    index: true // Indexing makes searching for logs much faster
  },
  // Reference to the user ID
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  // The email we want to display on the frontend
  userEmail: { 
    type: String, 
    required: true 
  },
  // What happened? (e.g., 'CREATE_NOTE', 'DELETE_NOTE', 'MOVE_NODE')
  action: { 
    type: String, 
    required: true 
  },
  // Human-readable description
  details: { 
    type: String, 
    required: true 
  },
  // When it happened
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-delete logs older than 30 days to keep DB clean (Optional)
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Log', logSchema);