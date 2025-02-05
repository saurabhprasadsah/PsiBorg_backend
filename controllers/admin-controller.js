const User = require("../models/users.js");
const Task = require("../models/tasks.js");
//Get All Users
module.exports.getAllUsersDetails = async (req, res) => {
  try {
    const users = await User.find({}).select({
      password: 0,
    });
    res.status(200).json({ users, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.postUserDetails = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ user, success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.manageUsersDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user, success: true });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.deleteUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User has been deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports.getAllTasksOfUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate({
      path: "tasks",
      model: "Task",
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ tasks: user.tasks, success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.updateTaskToUser = async (req, res) => {
  const {taskId } = req.params;
  const taskUpdates = req.body; // Task update data from the request body

  try {
   
    const task = await Task.findOneAndUpdate(taskId,taskUpdates);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found or not assigned to this user" });
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.deleteTaskFromUser = async (req, res) => {
  const { userId, taskId } = req.params;
  try {
    
    //Remove the task from the list of tasks
   const deletedTask= await Task.findByIdAndDelete(taskId);
   
    // Remove the task from the user's `tasks` array using Mongoose's `$pull` operator
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { tasks: taskId },
      },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    res.status(200).json({ user,deletedTask,success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.addTasksToUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const token = req.header("Authorization").replace("Bearer ", "").trim();
    const jwtVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // Create a new task using the Task model
    const newTask = new Task({
      ...req.body,
      assignedTo: userId,
      createdBy: jwtVerified.userId, // Assuming `req.user.id` is the logged-in user's ID
    });

    // Save the task to the database
    await newTask.save();

    // Add the task ID to the user's `tasks` array
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { tasks: newTask._id } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, task: newTask, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.allTasks=async(req,res)=>{
  try {
    const tasks=await Task.find({});
    res.status(200).json({tasks,success:true});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
}

module.exports.addTasks=async(req,res)=>{
  try {
    const newTask=new Task({...req.body});
    await newTask.save();
    res.status(201).json({task:newTask,success:true});
  } catch (error) {
    res.status(400).json({success:false,message:error.message});
  }
}

module.exports.updateTask=async(req,res)=>{
  const {taskId}=req.params;
  try {
    const updatedTask=await Task.findByIdAndUpdate(taskId,req.body,{new:true,runValidators:true});
    if(!updatedTask){
      return res.status(404).json({success:false,message:"Task not found"});
    }
    res.status(200).json({task:updatedTask,success:true});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
}

module.exports.deleteTask=async(req,res)=>{
  const {taskId}=req.params;
  try {
    const deletedTask=await Task.findByIdAndDelete(taskId);
    if(!deletedTask){
      return res.status(404).json({success:false,message:"Task not found"});
    }
    res.status(200).json({success:true,message:"Task deleted successfully"});
  } catch (error) {
    res.status(500).json({success:false,message:error.message});
  }
}