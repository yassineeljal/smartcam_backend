const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "access_granted",
        "access_denied",
        "motion_detected",
        "face_detected",
        "system_alert",
        "chest_opened",
        "chest_closed",
      ],
      index: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
