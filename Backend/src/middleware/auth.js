
const user = require('../models/User');
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ 
    success: false, 
    message: "Unauthorized: Please login with Google" 
  });
};