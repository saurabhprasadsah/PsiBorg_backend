const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Add Friend", "Accept Request", "Message", "Like", "Comment"],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "typeReference",
      default: null, // Can be null if not linked to a post or comment
    },
    typeReference: {
      type: String,
      enum: ["Post", "Comment", "Message"], // Defines the reference type
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false, // Allows soft deletion instead of removing the document
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Indexing for better query performance
notificationSchema.index({ recipient: 1, status: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
