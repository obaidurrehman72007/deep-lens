const Video = require('../models/Video');

exports.isOwner = async (req, res, next) => {
  const video = await Video.findById(req.params.videoId);
  if (!video) return res.status(404).send("Video not found");

  // Force both to strings to ensure they match!
  if (video.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
};