// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const protect = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
  
//   if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Verify user still exists
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }
    
//     req.user = user._id;
//     next();
//   } catch (error) {
//     console.error("Auth middleware error:", error);
//     res.status(401).json({ message: "Not authorized, token invalid" });
//   }
// };

// // Make sure to export it correctly
// module.exports = { protect };





const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Decoded token:', decoded);
    
    // Find user by ID from token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Set user in request
    req.user = user;
    console.log('User set in request:', req.user._id);
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

module.exports = { protect };