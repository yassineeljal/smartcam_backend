const express = require("express");
const router = express.Router();

const pythonRoutes = require("./pythonRoutes");
const eventRoutes = require("./eventRoutes");
const notificationRoutes = require("./notificationRoutes");
const statusRoutes = require("./statusRoutes");
const faceRoutes = require("./faceRoutes");

router.use("/python", pythonRoutes);
router.use("/events", eventRoutes);
router.use("/notifications", notificationRoutes);
router.use("/status", statusRoutes);
router.use("/faces", faceRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SmartCam API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
