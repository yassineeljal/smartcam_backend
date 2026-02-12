require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/smartcam",
  },

  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
      : ["*"],
  },

  apiKeyPython: process.env.API_KEY_PYTHON || "smartcam_secret_key_change_me",

  eventRetentionDays: parseInt(process.env.EVENT_RETENTION_DAYS, 10) || 30,

  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
  },
};
