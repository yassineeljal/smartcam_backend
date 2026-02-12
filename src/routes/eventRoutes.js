const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  getEventStats,
  deleteEvents,
} = require("../controllers/eventController");

router.get("/stats/summary", getEventStats);

router.get("/", getEvents);
router.get("/:id", getEventById);
router.delete("/", deleteEvents);

module.exports = router;
