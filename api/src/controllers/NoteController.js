const Note = require('../models/Note');
const Log = require('../models/Log');
const createLog = require('../utils/logger');
// 1. Get all notes for a specific video
exports.getNotes = async (req, res) => {
  try {
    const { videoId } = req.params;
    // Removing userId filter if you want a shared notebook, 
    // or keep it if you want private notes. 
    const notes = await Note.find({ videoId }).sort({ rawTime: 1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes", error: err.message });
  }
};

// 2. Create a new note
exports.addNote = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text, time, rawTime } = req.body;
    
    const newNote = new Note({
      videoId,
      userId: req.user._id,
      creatorEmail: req.user.email, // <--- SAVING THE EMAIL FROM SESSION
      text,
      time,
      rawTime
    });

    const savedNote = await newNote.save();

    // GENERATE LOG
    await createLog(
      req.params.videoId, 
      req.user, 
      'CREATE_NOTE', 
      `Added note: "${text.substring(0, 20)}..." at ${time}`
    );
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(500).json({ message: "Error saving note", error: err.message });
  }
};

// 3. Update note
exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { text } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId },
      { 
        text, 
        lastModified: Date.now(),
        lastEditedBy: req.user.email // <--- TRACKING WHO EDITED
      },
      { new: true }
    );

    if (!updatedNote) return res.status(404).json({ message: "Note not found" });
    await createLog(
      updatedNote.videoId, 
      req.user, 
      'UPDATE_NOTE', 
      `Edited note text to: "${text.substring(0, 20)}..."`
    );
    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: "Error updating note", error: err.message });
  }
};

// 4. Delete note
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const deletedNote = await Note.findOneAndDelete({ _id: noteId });
    if (!deletedNote) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};
exports.getVideoLogs = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Find logs for this video, sort by newest first
    const logs = await Log.find({ videoId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json(logs);
  } catch (err) {
    console.error("Fetch Logs Error:", err);
    res.status(500).json({ message: "Error fetching logs", error: err.message });
  }
};