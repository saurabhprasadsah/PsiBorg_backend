const jwt = require("jsonwebtoken");
const User = require("../models/users");
const rateLimit = require('express-rate-limit');

/**
 * @desc Rate limiter middleware for request throttling
 */
const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later" }
});

/**
 * @desc Middleware to validate JWT authentication
 */
const validateAuthToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/**
 * @desc Middleware to validate user registration input
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  next();
};

/**
 * @desc Middleware to check if user already exists
 */
const validateIsExist = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    next();
  } catch (error) {
    console.error("Error checking user existence:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc Middleware to validate login input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  next();
};

/**
 * @desc Middleware to check if user is registered before login
 */
const validateIsRegistered = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Attach user to request object for later use
    req.existingUser = user;
    next();
  } catch (error) {
    console.error("Error checking user registration:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  validateAuthToken,
  validateRegister,
  validateIsExist,
  validateLogin,
  validateIsRegistered,
  requestLimiter
};