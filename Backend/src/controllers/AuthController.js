const Workspace = require('../models/Workspace'); 

exports.googleAuthCallback = async (req, res) => {
  try {
    // Passport already populated req.user in your passport.js strategy
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=unauthorized`);
    }

    // Check if user needs a workspace (First-time login)
    const existingWorkspace = await Workspace.findOne({ userId: req.user._id });
    
    if (!existingWorkspace) {
      await Workspace.create({
        userId: req.user._id,
        name: `${req.user.displayName}'s Workspace`,
        isDefault: true
      });
      console.log(`Created new workspace for: ${req.user.displayName}`);
    }

    // REDIRECT TO VITE FRONTEND (e.g., http://localhost:5173/dashboard)
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    
  } catch (error) {
    console.error("Auth Callback Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false });
    
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Matches your express-session cookie name
      res.status(200).json({ success: true });
    });
  });
};
exports.getMe = (req, res) => {
  if (req.user) return res.json(req.user);
  res.status(401).json({ message: "Not logged in" });
}