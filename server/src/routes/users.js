const express = require("express");
const router = express.Router();
const { auth, isInstructor, isStudent } = require("../middleware/auth");
const User = require("../models/User");

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.password;
    delete updates.email;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
});

// Update instructor availability
router.put("/availability", auth, isInstructor, async (req, res) => {
  try {
    const { availability } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { availability } },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      availability: user.availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating availability",
      error: error.message,
    });
  }
});

// Update instructor hourly rate
router.put("/hourly-rate", auth, isInstructor, async (req, res) => {
  try {
    const { sessionRate } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { sessionRate } },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      sessionRate: user.sessionRate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating hourly rate",
      error: error.message,
    });
  }
});

// Search instructors
router.get("/search/instructors", async (req, res) => {
  try {
    const { city, state, country, minRate, maxRate, beltRank, minExperience } =
      req.query;

    const query = { role: "instructor" };

    // Add location filters if provided
    if (city) query["location.city"] = new RegExp(city, "i");
    if (state) query["location.state"] = new RegExp(state, "i");
    if (country) query["location.country"] = new RegExp(country, "i");

    // Add rate filters if provided
    if (minRate || maxRate) {
      query.sessionRate = {};
      if (minRate) query.sessionRate.$gte = Number(minRate);
      if (maxRate) query.sessionRate.$lte = Number(maxRate);
    }

    // Add belt rank filter if provided
    if (beltRank) query["bjjCredentials.beltRank"] = beltRank;

    // Add experience filter if provided
    if (minExperience) {
      query["bjjCredentials.yearsOfExperience"] = {
        $gte: Number(minExperience),
      };
    }

    const instructors = await User.find(query)
      .select("-password -availability")
      .sort({ "bjjCredentials.yearsOfExperience": -1 });

    res.json({
      success: true,
      instructors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching instructors",
      error: error.message,
    });
  }
});

// Get instructor details
router.get("/instructor/:id", async (req, res) => {
  try {
    const instructor = await User.findOne({
      _id: req.params.id,
      role: "instructor",
    }).select("-password");

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    res.json({
      success: true,
      instructor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching instructor details",
      error: error.message,
    });
  }
});

module.exports = router;
