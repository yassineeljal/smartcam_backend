const express = require("express");
const router = express.Router();
const {
  getStatus,
  getQuickStatus,
} = require("../controllers/statusController");

router.get("/", getStatus);
router.get("/quick", getQuickStatus);

module.exports = router;
