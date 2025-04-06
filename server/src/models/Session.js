const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["instructor_location", "student_location", "other"],
        required: true,
      },
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    notes: String,
    cancellationReason: String,
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
sessionSchema.index({ instructor: 1, date: 1 });
sessionSchema.index({ student: 1, date: 1 });
sessionSchema.index({ status: 1 });

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
