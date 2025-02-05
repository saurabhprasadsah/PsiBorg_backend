const express = require("express");
const Router = express.Router();
const {
  validateRegister,
  validateIsExist,
  validateLogin,
  validateAuthToken,
  validateIsRegistered,
  requestLimiter,
} = require("../middleware/auth-middleware.js");
const authController = require("../controllers/auth-controller");


//Register route it check user is already registered and send Confirmation mail ....
Router.route("/register").post(
  requestLimiter,
  validateRegister,
  validateIsExist,
  authController.register
);

//Login Route to validate login credentials ...
Router.route("/login").post(
  requestLimiter,
  validateLogin,
  validateIsRegistered,
  authController.login
);

//Logout Route to logout the logged in user ...
Router.route("/logout").get(
  validateAuthToken,
  authController.logout
)

//Auth route to validate the token...
Router.route("/validate-token").get(
  validateAuthToken,
  authController.validateAuthToken
);
module.exports = Router;
