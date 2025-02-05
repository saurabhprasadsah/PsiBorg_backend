const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileSettingsSchema = mongoose.Schema({
  //Your Name
  yourName: {
    type: String,
    default: "Anonymous",
    set: function (value) {
      return value || this.yourName;
    },
  },
  //About You
  aboutYou: {
    type: String,
    default: "Newbie",
    set: function (value) {
      return value || this.aboutYou;
    },
    maxlength: 500,
  },
});

// Define the User related Data Schema
const userInfo = Schema({
  //Avatar
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/dv1k0bazk/image/upload/v1735113432/download_2_tsakcp.jpg", // Default avatar URL
    set: function (value) {
      return value || this.avatar; // Use provided value or keep default
    },
  },
  //profile Settings Options
  profileSettings: {
    type: profileSettingsSchema,
    default: () => ({}),
  }, // Embedded schema

  //Friends
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      default: null,
    },
  ],

});

const UserInfo = mongoose.model("UserInfo", userInfo);

module.exports = UserInfo;
