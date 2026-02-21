const Log = require('../models/Log');

const createLog = async (videoId, user, action, details) => {
  try {
    await Log.create({
      videoId,
      userId: user._id,
      userEmail: user.email,
      action,
      details
    });
  } catch (err) {
    console.error("Logging Error:", err);
  }
};

module.exports = createLog;