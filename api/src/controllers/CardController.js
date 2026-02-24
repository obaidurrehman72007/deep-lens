const Video = require('../models/Video');

exports.getUserCards = async (req, res) => {
  try {
    const cards = await Video.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('title thumbnail youtubeUrl videoId createdAt');
    
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    await Video.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};