const mongoose = require("mongoose");

const authorizedFaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      unique: true,
    },

    imageBase64: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    stats: {
      totalRecognitions: { type: Number, default: 0 },
      lastRecognizedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuthorizedFace", authorizedFaceSchema);
