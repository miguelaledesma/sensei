const express = require("express");
const router = express.Router();
const { auth, isInstructor, isStudent } = require("../middleware/auth");
const Session = require("../models/Session");
const User = require("../models/User");

// Book a new session
router.post("/book", auth, isStudent, async (req, res) => {
  try {
    const {
      instructorId,
      date,
      startTime,
      endTime,
      duration,
      locationType,
      address,
      notes,
    } = req.body;

    // Get instructor details
    const instructor = await User.findOne({
      _id: instructorId,
      role: "instructor",
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // Check if instructor is available
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const isAvailable = instructor.availability.some((slot) => {
      if (slot.day !== dayOfWeek) return false;
      return slot.timeSlots.some((timeSlot) => {
        return timeSlot.startTime <= startTime && timeSlot.endTime >= endTime;
      });
    });

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Instructor is not available at this time",
      });
    }

    // Check if time slot is already booked
    const existingSession = await Session.findOne({
      instructor: instructorId,
      date,
      startTime,
      endTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    // Create new session
    const session = new Session({
      instructor: instructorId,
      student: req.user._id,
      date,
      startTime,
      endTime,
      duration,
      location: {
        type: locationType,
        address,
      },
      price: instructor.sessionRate * (duration / 60),
      notes,
      status: "pending",
    });

    await session.save();

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error booking session",
      error: error.message,
    });
  }
});

// Get user's sessions (as instructor or student)
router.get("/my-sessions", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "instructor"
        ? { instructor: req.user._id }
        : { student: req.user._id };

    const sessions = await Session.find(query)
      .populate("instructor", "firstName lastName profilePicture")
      .populate("student", "firstName lastName")
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sessions",
      error: error.message,
    });
  }
});

// Update session status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if user is authorized to update this session
    if (
      session.instructor.toString() !== req.user._id.toString() &&
      session.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this session",
      });
    }

    // Update session
    session.status = status;
    if (status === "cancelled" && cancellationReason) {
      session.cancellationReason = cancellationReason;
    }

    await session.save();

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating session status",
      error: error.message,
    });
  }
});

// Add review to completed session
router.post("/:id/review", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if session is completed
    if (session.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed sessions",
      });
    }

    // Check if user is the student
    if (session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only students can leave reviews",
      });
    }

    // Add review
    session.review = {
      rating,
      comment,
      createdAt: new Date(),
    };

    await session.save();

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
});

module.exports = router;
