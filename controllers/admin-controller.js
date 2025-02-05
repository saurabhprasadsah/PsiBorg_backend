const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/users");
const TaskModel = require("../models/tasks");

// Create the controller object first
const adminController = {
  /**
   * @desc Get all users (excluding passwords)
   * @route GET /admin/all-users
   */
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.find().select("-password").lean();
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * @desc Add a new user (Admin Only)
   * @route POST /admin/all-users
   */
  createUser: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({ name, email, password: hashedPassword });

      await newUser.save();
      res.status(201).json({ success: true, user: { name, email } });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * @desc Update user details (Admin Only)
   * @route PUT /admin/all-users/:userId
   */
  updateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Restrict updates to allowed fields
      const allowedFields = ["name", "email"];
      const isValidUpdate = Object.keys(updates).every((field) => allowedFields.includes(field));

      if (!isValidUpdate) {
        return res.status(400).json({ success: false, message: "Invalid update fields" });
      }

      const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
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
  },

  /**
   * @desc Delete a user (Admin Only)
   * @route DELETE /admin/all-users/:userId
   */
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const deletedUser = await UserModel.findByIdAndDelete(userId);

      if (!deletedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * @desc Get all tasks assigned to a user
   * @route GET /admin/all-users/:userId/tasks
   */
  getUserTasks: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await UserModel.findById(userId).populate("tasks");

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, tasks: user.tasks });
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

// Debug log after the controller is defined
//console.log("Admin Controller Loaded: ", adminController);

// Validation check after the controller is defined
if (!adminController.createUser) {
  throw new Error("Error: 'createUser' function is undefined in admin-controller.js");
}

// Export the controller
module.exports = adminController;