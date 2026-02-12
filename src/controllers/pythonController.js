const asyncHandler = require("../middlewares/asyncHandler");
const { processEvent, heartbeat } = require("../services/eventService");

const postEvent = asyncHandler(async (req, res) => {
  const { type, data = {}, timestamp } = req.body;

  if (!type) {
    return res.status(400).json({
      success: false,
      error: 'Le champ "type" est requis.',
    });
  }

  const validTypes = [
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
  ];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Type invalide "${type}". Types valides : ${validTypes.join(", ")}`,
    });
  }

  const event = await processEvent(type, data, {
    pythonTimestamp: timestamp ? new Date(timestamp) : null,
  });

  res.status(201).json({
    success: true,
    event: {
      id: event._id,
      type: event.type,
      createdAt: event.createdAt,
    },
  });
});

const postHeartbeat = asyncHandler(async (req, res) => {
  const { frameNumber, facesCount } = req.body;

  await heartbeat({ frameNumber, facesCount });

  res.status(200).json({ success: true });
});

const postBatch = asyncHandler(async (req, res) => {
  const { events } = req.body;

  if (!events || !Array.isArray(events)) {
    return res.status(400).json({
      success: false,
      error: 'Le champ "events" (tableau) est requis.',
    });
  }

  const results = [];
  for (const evt of events) {
    try {
      const event = await processEvent(evt.type, evt.data || {}, {
        pythonTimestamp: evt.timestamp ? new Date(evt.timestamp) : null,
      });
      results.push({ id: event._id, type: event.type, success: true });
    } catch (error) {
      results.push({ type: evt.type, success: false, error: error.message });
    }
  }

  res.status(201).json({ success: true, results });
});

module.exports = {
  postEvent,
  postHeartbeat,
  postBatch,
};
