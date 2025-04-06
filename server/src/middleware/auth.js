const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Please authenticate",
      error: error.message,
    });
  }
};

// Middleware to check if user is an instructor
const isInstructor = async (req, res, next) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Instructor only.",
    });
  }
  next();
};

// Middleware to check if user is a student
const isStudent = async (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Student only.",
    });
  }
  next();
};

module.exports = {
  auth,
  isInstructor,
  isStudent,
};
