const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/users");
const TaskModel = require("../models/tasks");
const { validationResult } = require("express-validator");

/**
 * @desc Fetch all users (excluding passwords)
 * @route GET /users
 */
module.exports.fetchAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password").lean();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc Get all tasks assigned to a manager
 * @route GET /manager/:managerId/tasks
 */
module.exports.getManagerTasks = async (req, res) => {
  try {
    const { managerId } = req.params;
    const manager = await UserModel.findById(managerId).populate("tasks");

    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" });
    }

    res.status(200).json({ success: true, tasks: manager.tasks });
  } catch (error) {
    console.error("Error fetching manager tasks:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Register a new user
 * @route POST /users/register
 */
module.exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ name, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ success: true, user: { name, email } });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update a user’s profile
 * @route PUT /users/:userId
 */
module.exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const allowedUpdates = ["name", "email"];
    const updates = Object.keys(req.body);

    if (!updates.every((field) => allowedUpdates.includes(field))) {
      return res.status(400).json({ success: false, message: "Invalid update fields" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Assign a task to a user
 * @route POST /users/:userId/tasks
 */
module.exports.assignTaskToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const newTask = new TaskModel({ ...req.body, assignedTo: userId, createdBy: decoded.userId });

    await newTask.save();
    await UserModel.findByIdAndUpdate(userId, { $push: { tasks: newTask._id } });

    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
