const { userSchema, loginSchema } = require("../schema/auth-schema.js");
const Blacklist= require("../models/blacklist.js");
const User = require("../models/users.js");
const jwt = require("jsonwebtoken");
const rateLimit= require('express-rate-limit');

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: "Too many attempts from this IP. Please try again later.",
});

module.exports={requestLimiter};
module.exports.validateRegister = async (req, res, next) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      next();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.validateIsExist = async (req, res, next) => {
  try {
    const isExisted = await User.findOne({ email: req.body.email });
    if (isExisted) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already exists" });
    } else {
      next();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.validateLogin = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      next();
    }
  } catch (err) {
    res.status(err.status).json({ success: false, message: err.message });
  }
};

module.exports.validateIsRegistered = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
    } else {
      const areValidCredentials= await  user.comparePassword(req.body.password);
      if (!areValidCredentials) {
        res
          .status(401)
          .json({ message: "Invalid credentials", success: false });
      } else {
        next();
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};


//User Router Middleware
//creating a middleware to check whether user has the token or not
module.exports.validateAuthToken = async (req, res, next) => {
  // Validate JWT token here
  try {
    if (!req.header("Authorization")) {
      return res.status(403).json({ message: "No Token Provided", success: false });
    } else {
      const token = req.header("Authorization").replace("Bearer ", "").trim();
      if (!token) throw new Error("No token provided");
      
      // Check if the token is blacklisted
    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
      return res
        .status(403)
        .json({ success: false, message: "Token is invalid (blacklisted)." });
      }
      const jwtVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (jwtVerified) next();
      else
        res.status(403).json({
          success: false,
          message:
            "You are not authorized to access this page without registering first!",
        });
    }
  } catch (error) {
    if (error.message === "No token provided") {
      res
        .status(401)
        .json({ success: false, message: "Authentication token is missing." });
    } else if (
      error.message === "You are not authorized to access this page "
    ) {
      res.status(403).json({ success: false, message: "Access denied." });
    } else if (
      error.message === "jwt malformed" ||
      error.message === "invalid signature"
    ) {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired token." });
    } else {
      res.status(500).json({ message: error.message, success: false });
    }
  }
};
