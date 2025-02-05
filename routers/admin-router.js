const express = require("express");
const Router = express.Router();
const adminController = require("../controllers/admin-controller");

const { validateAuthToken, validateRegister } = require("../middleware/auth-middleware");
const { authorizeRole } = require("../middleware/roleCheck-middleware");
const { isUserValid } = require("../middleware/user-middleware");

// // Debug: Print Loaded Admin Controller
// console.log("Admin Controller Loaded: ", adminController);

// // Throw error if `createUser` is missing
// if (!adminController.createUser) {
//   throw new Error("Error: 'createUser' function is undefined in admin-controller.js");
// }

// Get all users and create new user (Admin Only)
Router.route("/all-users")
  .get(validateAuthToken, authorizeRole(["viewAllProfiles"]), isUserValid, adminController.getAllUsers)
  .post(validateAuthToken, validateRegister, authorizeRole(["createUser"]), isUserValid, adminController.createUser);

// Manage a single user (Update/Delete)
Router.route("/all-users/:userId")
  .put(validateAuthToken, authorizeRole(["manageUsers"]), isUserValid, adminController.updateUser)
  .delete(validateAuthToken, authorizeRole(["manageUsers"]), isUserValid, adminController.deleteUser);

// Get all tasks assigned to a user
Router.route("/all-users/:userId/tasks")
  .get(validateAuthToken, authorizeRole(["viewAllTasks"]), isUserValid, adminController.getUserTasks);

module.exports = Router;
