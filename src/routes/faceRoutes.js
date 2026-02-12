const express = require("express");
const router = express.Router();
const { requireApiKey } = require("../middlewares/auth");
const {
  getFaces,
  getFaceById,
  createFace,
  updateFace,
  deleteFace,
} = require("../controllers/faceController");

router.get("/", getFaces);
router.get("/:id", getFaceById);
router.post("/", createFace);
router.put("/:id", updateFace);
router.delete("/:id", deleteFace);

module.exports = router;
