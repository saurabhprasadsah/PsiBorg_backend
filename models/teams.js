const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      default: "" 
    },
    manager: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, 
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], 
    isDeleted: { 
      type: Boolean, 
      default: false // Supports soft deletion
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Indexing for faster queries
TeamSchema.index({ name: 1, manager: 1 });

const Team = mongoose.model("Team", TeamSchema);

module.exports = Team;
