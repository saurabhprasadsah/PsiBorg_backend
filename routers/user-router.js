const express = require("express");
const Router = express.Router();

const userController = require("../controllers/user-controller");
const { isUserValid } = require("../middleware/user-middleware");
const { authorizeRole } = require("../middleware/roleCheck-middleware");

/**
 * @route GET /users
 * @desc Get all users
 */
Router.route("/").get(userController.fetchAllUsers);

/**
 * @route POST /users/register
 * @desc Register a new user
 */
Router.route("/register").post(userController.createUser);

/**
 * @route PUT /users/:userId
 * @desc Update user profile
 */
Router.route("/:userId").put(isUserValid, userController.updateUser);

/**
 * @route POST /users/:userId/tasks
 * @desc Assign a task to a user
 */
Router.route("/:userId/tasks").post(isUserValid, authorizeRole(["assignTasks"]), userController.assignTaskToUser);

/**
 * @route GET /manager/:managerId/tasks
 * @desc Get all tasks assigned to a manager
 */
Router.route("/manager/:managerId/tasks").get(isUserValid, authorizeRole(["manageTeamTasks"]), userController.getManagerTasks);

module.exports = Router;
