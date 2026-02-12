const express = require("express");
const router = express.Router();
const { requireApiKey } = require("../middlewares/auth");
const {
  postEvent,
  postHeartbeat,
  postBatch,
} = require("../controllers/pythonController");
const { syncFaces } = require("../controllers/faceController");

router.use(requireApiKey);

router.post("/event", postEvent);
router.post("/heartbeat", postHeartbeat);
router.post("/batch", postBatch);
router.post("/sync-faces", syncFaces);

module.exports = router;
