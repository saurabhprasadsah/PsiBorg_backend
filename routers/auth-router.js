const express = require("express");
const Router = express.Router();
const authController = require("../controllers/auth-controller");
const {
  validateRegister,
  validateIsExist,
  validateLogin,
  validateAuthToken,
  validateIsRegistered,
  requestLimiter,
} = require("../middleware/auth-middleware.js");

// Debugging: Log Auth Controller
//console.log("Loaded Auth Controller: ", authController);

// Throw error if registerUser function is missing
if (!authController.registerUser) {
  throw new Error("Error: 'registerUser' function is undefined in auth-controller.js");
}

// ✅ FIXED: Use `registerUser` instead of `register`
Router.route("/register").post(
  requestLimiter,
  validateRegister,
  validateIsExist,
  authController.registerUser // ✅ Correct function name
);

// ✅ FIXED: Use `loginUser` instead of `login`
Router.route("/login").post(
  requestLimiter,
  validateLogin,
  validateIsRegistered,
  authController.loginUser // ✅ Correct function name
);

// ✅ FIXED: Use `logoutUser` instead of `logout`
Router.route("/logout").get(validateAuthToken, authController.logoutUser);

// ✅ FIXED: Use `validateUserToken` instead of `validateAuthToken`
Router.route("/validate-token").get(validateAuthToken, authController.validateUserToken);

module.exports = Router;
