const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/users.js");
const TaskModel = require("../models/tasks.js");
const { validationResult } = require("express-validator");

//  Get All Users (Excluding Password)
module.exports.fetchAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}).select("-password").lean();
    res.status(200).json({ users, success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getManagerTasks = async (req, res) => {
  try {
    const { managerId } = req.params;

    const manager = await User.findById(managerId).populate("tasks");

    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" });
    }

    res.status(200).json({ success: true, tasks: manager.tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//  Register a New User (Hashed Password)
module.exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, user: { name, email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Update User Details (Only Allowed Fields)
module.exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const allowedUpdates = ["name", "email"];
    const updates = Object.keys(req.body);

    // Validate allowed fields
    const isValidUpdate = updates.every((field) => allowedUpdates.includes(field));
    if (!isValidUpdate) {
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
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete a User
module.exports.removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get All Tasks of a User
module.exports.fetchUserTasks = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId).populate("tasks");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, tasks: user.tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Update a Task (More Secure)
module.exports.modifyTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete Task from User
module.exports.removeUserTask = async (req, res) => {
  const { userId, taskId } = req.params;
  try {
    const task = await TaskModel.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    await UserModel.findByIdAndUpdate(userId, { $pull: { tasks: taskId } });

    res.status(200).json({ success: true, message: "Task removed from user" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Assign Task to a User
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
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get All Tasks
module.exports.fetchAllTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.find({});
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Add New Task
module.exports.createTask = async (req, res) => {
  try {
    const newTask = new TaskModel(req.body);
    await newTask.save();
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//  Delete a Task
module.exports.removeTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const deletedTask = await TaskModel.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getManagerTasks,
  updateTasks,
  deleteTasks,
  getAllYourTeamMembers,
  assignTask,
  getProfileDetails,
  getUserTasks,
};