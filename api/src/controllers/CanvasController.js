const Canvas = require('../models/Canvas');
exports.getCanvasData = async (req, res) => {
  try {
    const { videoId } = req.params;
    const canvas = await Canvas.findOne({ videoId });
    if (!canvas) {
      return res.json({ 
        elements: [], 
        camera: { x: 0, y: 0, zoom: 1 },
        userId: req.user?._id || null 
      });
    }
    const isOwner = req.user && canvas.userId && canvas.userId.toString() === req.user._id.toString();
    const hasSharedAccess = req.query.token || req.headers['x-shared-token'];
    if (!isOwner && !hasSharedAccess) {
    }
    res.json(canvas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.saveCanvasData = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { elements, camera } = req.body;
    const canvas = await Canvas.findOneAndUpdate(
      { videoId: videoId },
      { 
        elements, 
        camera,
        userId: req.user._id 
      },
      { 
        returnDocument: true, 
        upsert: true, 
        setDefaultsOnInsert: true,
        runValidators: true 
      }
    );
    res.status(200).json(canvas);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Conflict: Save already in progress." });
    }
    console.error("CANVAS SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
