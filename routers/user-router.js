const express = require("express");
const Router = express.Router();

const userController = require("../controllers/user-controller.js");
const { validateAuthToken } = require("../middleware/auth-middleware.js");
const { authorizeRole } = require("../middleware/roleCheck-middleware.js");
const { isUserValid } = require("../middleware/user-middleware.js");

//  Manager Routes
//  Get all tasks of the manager's team
Router.route("/manager/:managerId/tasks").get(
  validateAuthToken,
  authorizeRole(["manageTeamTasks"]),
  isUserValid,
  userController.getManagerTasks
);

// Update or delete team tasks
Router.route("/manager/:managerId/tasks/:taskId")
  .put(
    validateAuthToken,
    authorizeRole(["manageTeamTasks"]),
    isUserValid,
    userController.updateTasks
  )
  .delete(
    validateAuthToken,
    authorizeRole(["manageTeamTasks"]),
    isUserValid,
    userController.deleteTasks
  );

//  Get all team members' profiles
Router.route("/manager/:managerId/team-members").get(
  validateAuthToken,
  authorizeRole(["viewTeamProfiles"]),
  isUserValid,
  userController.getAllYourTeamMembers
);

// Assign tasks to team members
Router.post(
  "/manager/:managerId/tasks/assign",
  validateAuthToken,
  authorizeRole(["assignTasks"]),
  isUserValid,
  userController.assignTask
);

// Get user profile
Router.route("/:userId").get(
  validateAuthToken,
  isUserValid,
  userController.getProfileDetails
);

// Get assigned tasks
Router.route("/:userId/tasks").get(
  validateAuthToken,
  authorizeRole(["manageOwnTasks"]),
  isUserValid,
  userController.getUserTasks
);

module.exports = Router;
