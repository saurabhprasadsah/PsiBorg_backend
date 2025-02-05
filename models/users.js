const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    //Username
    username: {
      type: String,
      required: true,
      minlength: 2,
    },
    //Email
    email: {
      type: String,
      match: [
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
        "Email must be a valid Email.",
      ],
      required: true,
      unique: true,
    },

    // User information (optional)
    userData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      default: null,
    },

    // Password
    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    // User role
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },

    //User tasks
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true }
);

// Secure the password using pre method of mongoose and argon2 package
userSchema.pre("save", async function (next) {
  const currUser = this;
  if (!currUser.isModified("password")) {
    next();
  }
  try {
    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(currUser.password, saltRound);
    currUser.password = hash_password;
  } catch (error) {
    next(new Error("Unable to store password. Please try again."));
  }
});

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  try {
    const hashedPassword = this.password;
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Unable to compare the password. Please try again.");
  }
};

// Json Web Token
userSchema.methods.generateJsonWebToken = async function () {
  try {
    const token = jwt.sign(
      {
        userId: this._id.toString(),
        username: this.username,
        email: this.email,
        role: this.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    return token;
  } catch (error) {
    next(new Error("Unable to compare the password. Please try again."));
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
