const SharedLink = require('../models/SharedLink');
const Canvas = require('../models/Canvas');
const Video = require('../models/Video');
const crypto = require('crypto');

// 1. Logic for POST /share/:videoId
exports.createShareLink = async (req, res) => {
  try {
    const { videoId } = req.params;
    console.log("Generating link for video:", videoId); // DEBUG LOG

    // 1. Try to find an existing link
    let sharedLink = await SharedLink.findOne({ videoId });

    // 2. If not found, create a new one
    if (!sharedLink) {
      const token = crypto.randomBytes(16).toString('hex');
      sharedLink = new SharedLink({ 
        videoId, 
        token 
      });
      await sharedLink.save();
      console.log("New link saved to DB:", sharedLink); // DEBUG LOG
    }

    res.json({ token: sharedLink.token });
  } catch (err) {
    console.error("Link Generation Error:", err);
    res.status(500).json({ error: "Failed to create share link" });
  }
};

// 2. Logic for GET /shared/:token (Public - EXACT PREVIEW)
exports.getSharedContent = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Populate videoId to get title and URL
    const sharedLink = await SharedLink.findOne({ token }).populate('videoId');
    
    if (!sharedLink || !sharedLink.videoId) {
      return res.status(404).json({ message: "Link invalid or expired" });
    }

    const videoId = sharedLink.videoId._id;

    // Fetch everything related to this video in parallel
    const [canvas, notes] = await Promise.all([
      Canvas.findOne({ videoId }),
      Note.find({ videoId }).sort({ createdAt: -1 }) // Assuming you have a Note model
    ]);
    
    res.json({
      videoId: videoId,
      videoTitle: sharedLink.videoId.title,
      videoUrl: sharedLink.videoId.youtubeUrl || sharedLink.videoId.url, 
      elements: canvas ? canvas.elements : [],
      camera: canvas ? canvas.camera : { x: 0, y: 0, zoom: 1 },
      notes: notes || [] 
    });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching shared content" });
  }
};
exports.getSharedCanvasData = async (req, res) => {
  try {
    const { token,videoId } = req.params;
    
    // 1. Find the link and populate the video details
    const sharedLink = await SharedLink.findOne({ token }).populate('videoId');
    
    if (!sharedLink || !sharedLink.videoId) {
      return res.status(404).json({ message: "Link invalid or video removed" });
    }

    // 2. Fetch the canvas data
    const canvas = await Canvas.findOne({ videoId: sharedLink.videoId._id });
    
    // 3. Construct a reliable YouTube URL
    // We use the 'videoId' field from your Video model (the 11-char YT string)
    const ytId = sharedLink.videoId.videoId;
    const constructedUrl = `https://www.youtube.com/watch?v=${ytId}`;

    // Return everything needed for the full VideoCanvas experience
    res.json({
      videoId: sharedLink.videoId._id,       // DB ID
      youtubeId: ytId,
      ownerId: sharedLink.videoId.userId,                       // String ID (e.g. AbkEmIgJMcU)
      videoUrl: sharedLink.videoId.url || constructedUrl, // Use existing URL or the one we built
      videoTitle: sharedLink.videoId.title,
      canvasData: canvas || { elements: [], camera: { x: 0, y: 0, zoom: 1 } }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};