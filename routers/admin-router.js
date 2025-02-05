const express = require("express");
const Router = express.Router();
const adminController=require('../controllers/admin-controller.js');
const {validateAuthToken,validateRegister}=require('../middleware/auth-middleware.js')
const {authorizeRole}=require('../middleware/roleCheck-middleware.js');
const {isUserValid}=require('../middleware/user-middleware.js')

// All Admin Routes ..
//1. To get all users and (add)
Router.route('/all-users')
.get(validateAuthToken,authorizeRole(["viewAllProfiles"]),isUserValid,adminController.getAllUsersDetails)
.post(validateAuthToken,validateRegister,authorizeRole(["viewAllProfiles"]),isUserValid,adminController.postUserDetails);

//2. to manage single user (delete, update)
Router.route('/all-users/:userId')
.put(validateAuthToken,authorizeRole(["manageUsers"]),isUserValid,adminController.manageUsersDetails)
.delete(validateAuthToken,authorizeRole(["manageUsers"]),isUserValid,adminController.deleteUserDetails)

//3. to get all tasks (add tasks)
Router.route('/all-users/:userId/tasks')
.get(validateAuthToken,authorizeRole(["viewAllTasks"]),isUserValid,adminController.getAllTasksOfUser)
.post(validateAuthToken,authorizeRole(["viewAllTasks"]),isUserValid,adminController.addTasksToUser);

//4. to manage single task (update, delete)
Router.route('/all-users/:userId/tasks/:taskId')
.put(validateAuthToken,authorizeRole(["assignTasks"]),isUserValid,adminController.updateTaskToUser)
.delete(validateAuthToken,authorizeRole(["assignTasks"]),isUserValid,adminController.deleteTaskFromUser);

//5. to get all tasks 
Router.route('/all-tasks')
.get(validateAuthToken,authorizeRole(["manageAllTasks"]),isUserValid,adminController.allTasks)
.post(validateAuthToken,authorizeRole(["manageAllTasks"]),isUserValid,adminController.addTasks);

//6. to manage single task (update, delete)
Router.route('/all-tasks/:taskId')
.put(validateAuthToken,authorizeRole(["manageAllTasks"]),isUserValid,adminController.updateTask)
.delete(validateAuthToken,authorizeRole(["manageAllTasks"]),isUserValid,adminController.deleteTask);


module.exports=Router;