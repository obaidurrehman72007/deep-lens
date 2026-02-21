const Video = require('../models/Video');
const Canvas = require('../models/Canvas');
const { getTranscript } = require('youtube-transcript-api');
const OpenAI = require('openai');
const { generateShareableToken } = require('../utils/LinkHelper');


exports.addVideo = async (req, res) => {
  try {
    const { url, title } = req.body;
    const videoId = url.includes('v=') 
  ? url.split('v=')[1]?.split('&')[0] 
  : url.split('/').pop();

    const video = await Video.create({
      userId: req.user._id,
      videoId,
      youtubeUrl: url,
      title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.generateAISummary = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // 1. Get the user and check for their personal API Key
    const user = await User.findById(req.user._id);
    if (!user || !user.openaiKey) {
      return res.status(400).json({ 
        success: false, 
        message: "OpenAI API Key missing. Please add your key in Settings." 
      });
    }

    // 2. Fetch Video and Transcript
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const transcriptData = await getTranscript(video.youtubeId); // Use stored YouTube ID
    const text = transcriptData.map(t => t.text).join(' ');

    // 3. Initialize OpenAI with the USER'S key
    const openai = new OpenAI({
      apiKey: user.openaiKey, 
    });

    // 4. Request AI Completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o is faster and cheaper than gpt-4
      messages: [
        { 
          role: "system", 
          content: "You are a visual learning assistant. Summarize videos into a mind-map structure." 
        },
        { 
          role: "user", 
          content: `Analyze this transcript and return a JSON object with:
            1. 'summary': A brief text summary.
            2. 'nodes': An array of { id: string, data: { label: string }, position: { x: number, y: number } }
            3. 'edges': An array of { id: string, source: string, target: string }
            Transcript: ${text.substring(0, 12000)}` // Limit length to avoid token overflow
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(completion.choices[0].message.content);
    
    // 5. Save to Canvas (Fixed 'upsate' typo to 'upsert')
    const canvas = await Canvas.findOneAndUpdate(
      { videoId },
      { 
        nodes: aiData.nodes, 
        edges: aiData.edges,
        lastUpdated: Date.now()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ 
      success: true,
      summary: aiData.summary, 
      canvas 
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.status === 401 ? "Invalid OpenAI Key" : error.message 
    });
  }
};
exports.createShareLink = async (req, res) => {
  try {
    const { videoId } = req.params;
    const token = generateShareableToken();

    const video = await Video.findByIdAndUpdate(
      videoId,
      { shareToken: token, isPublic: true },
      { new: true }
    );

    if (!video) return res.status(404).json({ message: "Video not found" });

    res.json({
      shareLink: `${process.env.FRONTEND_URL}/shared/${token}`,
      video
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    // Important: Use findById
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Return the video object directly
    res.status(200).json(video);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};