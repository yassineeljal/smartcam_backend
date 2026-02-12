const mongoose = require("mongoose");

const systemStatusSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: "smartcam_status",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastHeartbeat: {
      type: Date,
      default: null,
    },

    pirStatus: {
      isAvailable: { type: Boolean, default: false },
      isActive: { type: Boolean, default: false },
      lastMotionAt: { type: Date, default: null },
    },

    chestStatus: {
      isAvailable: { type: Boolean, default: false },
      isOpen: { type: Boolean, default: false },
      lastOpenedAt: { type: Date, default: null },
      lastClosedAt: { type: Date, default: null },
    },

    cameraStatus: {
      isConnected: { type: Boolean, default: false },
      url: { type: String, default: null },
      lastFrameAt: { type: Date, default: null },
    },

    recognition: {
      isProcessing: { type: Boolean, default: false },
      progress: { type: Number, default: 0, min: 0, max: 100 },
      currentStep: { type: String, default: null },
      totalComparisons: { type: Number, default: 0 },
      currentComparison: { type: Number, default: 0 },
    },

    stats: {
      totalFramesProcessed: { type: Number, default: 0 },
      totalFacesDetected: { type: Number, default: 0 },
      totalAccessGranted: { type: Number, default: 0 },
      totalAccessDenied: { type: Number, default: 0 },
      totalMotions: { type: Number, default: 0 },
      uptimeSeconds: { type: Number, default: 0 },
      startedAt: { type: Date, default: null },
    },

    authorizedFacesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SystemStatus", systemStatusSchema);
