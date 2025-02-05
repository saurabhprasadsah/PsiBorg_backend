const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/users.js");
const sendConfirmationMail = require("../utils/sendMail.js");
const BlacklistModel = require("../models/blacklist.js");

/**
 * @desc Register a new user and send confirmation email
 * @route POST /auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already registered" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user data
    const newUser = new UserModel({ username, email, password: hashedPassword });
    await newUser.save();

    // Send confirmation email
    await sendConfirmationMail(email);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: newUser._id,
      token,
    });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Login a user
 * @route POST /auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      userId: user._id,
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Logout a user by blacklisting token
 * @route GET /auth/logout
 */
const logoutUser = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }

    // Check if token is already blacklisted
    const isBlacklisted = await BlacklistModel.findOne({ token });
    if (isBlacklisted) {
      return res.status(200).json({ success: true, message: "Already logged out." });
    }

    // Save token to blacklist
    await BlacklistModel.create({ token });

    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ success: false, message: "An error occurred while logging out." });
  }
};

/**
 * @desc Validate JWT Token
 * @route GET /auth/validate-token
 */
const validateUserToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    // Verify token
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);

    res.status(200).json({ success: true, message: "Valid Token", userId: verifiedUser.userId });
  } catch (error) {
    console.error("Error in token validation:", error);
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, validateUserToken };
