const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      default: null, // Allows unassigned tasks
    },
    teamId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Team",
      default: null, 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: { 
      type: Boolean, 
      default: false, // Soft delete support
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Indexing for optimized query performance
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ teamId: 1 });

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
