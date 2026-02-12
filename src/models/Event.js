const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "motion_detected",
        "face_detected",
        "recognition_start",
        "recognition_progress",
        "access_granted",
        "access_denied",
        "chest_opened",
        "chest_closed",
        "system_start",
        "system_stop",
        "error",
      ],
      index: true,
    },

    data: {
      personName: { type: String, default: null },
      distance: { type: Number, default: null },
      threshold: { type: Number, default: null },
      facesCount: { type: Number, default: null },
      frameNumber: { type: Number, default: null },
      progress: { type: Number, default: null, min: 0, max: 100 },
      comparedWith: { type: String, default: null },
      totalComparisons: { type: Number, default: null },
      currentComparison: { type: Number, default: null },
      errorMessage: { type: String, default: null },
      pirActive: { type: Boolean, default: null },
      chestOpen: { type: Boolean, default: null },
      snapshot: { type: String, default: null },
    },

    pythonTimestamp: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

eventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

eventSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);
