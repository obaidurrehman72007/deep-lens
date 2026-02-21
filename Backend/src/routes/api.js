const express = require('express');
const router = express.Router();
const passport = require('passport'); // ADD THIS LINE

const authController = require('../controllers/AuthController');
const videoController = require('../controllers/VideoController');
const canvasController = require('../controllers/CanvasController');
const cardController = require('../controllers/CardController');
const shareController = require('../controllers/ShareController'); // Points to the controller above
const noteController = require('../controllers/NoteController'); // Points to the controller above

const { isAuthenticated } = require('../middleware/auth');
const { isOwner } = require('../middleware/ownership');
const User = require('../models/User')
const Log = require('../models/Log');

router.get('/video/:videoId/notes', isAuthenticated, noteController.getNotes);
router.post('/video/:videoId/notes', isAuthenticated, noteController.addNote);
router.put('/notes/:noteId', isAuthenticated, noteController.updateNote);
router.delete('/notes/:noteId', isAuthenticated, noteController.deleteNote);
router.get('/video/:videoId/logs', isAuthenticated, async (req, res) => {
  const logs = await Log.find({ videoId: req.params.videoId })
    .sort({ timestamp: -1 })
    .limit(20);
  res.json(logs);
});

// Ensure the parameter name is :id to match req.params.id
router.get('/video/:id', videoController.getVideoById);
router.post('/video/add', isAuthenticated, videoController.addVideo);
router.post('/video/:videoId/summarize', isAuthenticated, isOwner, videoController.generateAISummary);


// --- AUTH ROUTES ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.googleAuthCallback);
router.get('/auth/logout', authController.logout);
router.get('/auth/me', isAuthenticated, (req, res) => {
  res.json(req.user); // Passport puts the user object here automatically
});

// --- DASHBOARD / CARD ROUTES ---
router.get('/cards', isAuthenticated, cardController.getUserCards);
router.delete('/cards/:id', isAuthenticated, cardController.deleteCard);

// --- VIDEO & AI ROUTES ---

// --- CANVAS & REAL-TIME ROUTES ---
router.get('/canvas/:videoId', isAuthenticated,  canvasController.getCanvasData);
router.post('/canvas/:videoId/save', isAuthenticated,  canvasController.saveCanvasData);
// --- SHARING ROUTES ---
router.post('/shared/:videoId', isAuthenticated,  shareController.createShareLink);
router.get('/shared/:token',isAuthenticated, shareController.getSharedContent);
router.get('/shared-canvas/:token',isAuthenticated, shareController.getSharedCanvasData);
// --- Open Ai Key ---
router.post('/user/settings/key', isAuthenticated, async (req, res) => {
  try {
    const { apiKey } = req.body;
    // Basic validation: OpenAI keys usually start with 'sk-'
    if (!apiKey.startsWith('sk-')) return res.status(400).json({ message: "Invalid API Key format" });

    await User.findByIdAndUpdate(req.user._id, { openaiKey: apiKey });
    res.json({ message: "API Key saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;