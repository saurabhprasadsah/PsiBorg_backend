const User = require("../models/users");
const jwt = require("jsonwebtoken");

const isUserValid = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "").trim();
    const jwtVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!jwtVerified.userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    else {
      const user = await User.findOne({ _id: jwtVerified.userId });
      if (!user) return res.status(401).json({ message: "Invalid token" });
      else {
        next();
      }
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const doUserExists = async (req, res, next) => {
  const { userId, friendId } = req.params;
  try {
    //first try to fetch that user's friend exists or not
    const friend = await User.findById(friendId);
    const user = await User.findById(userId);

    if (!friend || !user) {
      return res.status(404).json({ message: "User or friend not found" });
    } else if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    } else if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else{
      next();
    }
  } catch (error) {
    res
      .status(error.statusCode)
      .json({ message: error.message, success: false });
  }
};

module.exports = { isUserValid,doUserExists };

// const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");