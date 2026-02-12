const asyncHandler = require("../middlewares/asyncHandler");
const { AuthorizedFace } = require("../models");

const getFaces = asyncHandler(async (req, res) => {
  const { activeOnly } = req.query;
  const filter = {};
  if (activeOnly === "true") filter.isActive = true;

  const faces = await AuthorizedFace.find(filter)
    .sort({ name: 1 })
    .lean();

  res.json({ success: true, data: faces });
});

const getFaceById = asyncHandler(async (req, res) => {
  const face = await AuthorizedFace.findById(req.params.id).lean();

  if (!face) {
    return res.status(404).json({
      success: false,
      error: "Visage non trouve",
    });
  }

  res.json({ success: true, data: face });
});

const createFace = asyncHandler(async (req, res) => {
  const { name, fileName, imageBase64 } = req.body;

  if (!name || !fileName) {
    return res.status(400).json({
      success: false,
      error: 'Les champs "name" et "fileName" sont requis.',
    });
  }

  const existing = await AuthorizedFace.findOne({ fileName });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `Un visage avec le fichier "${fileName}" existe deja.`,
    });
  }

  const face = await AuthorizedFace.create({
    name,
    fileName,
    imageBase64: imageBase64 || null,
  });

  res.status(201).json({ success: true, data: face });
});

const updateFace = asyncHandler(async (req, res) => {
  const { name, fileName, imageBase64, isActive } = req.body;
  const update = {};

  if (name !== undefined) update.name = name;
  if (fileName !== undefined) update.fileName = fileName;
  if (imageBase64 !== undefined) update.imageBase64 = imageBase64;
  if (isActive !== undefined) update.isActive = isActive;

  const face = await AuthorizedFace.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!face) {
    return res.status(404).json({
      success: false,
      error: "Visage non trouve",
    });
  }

  res.json({ success: true, data: face });
});

const deleteFace = asyncHandler(async (req, res) => {
  const face = await AuthorizedFace.findByIdAndDelete(req.params.id);

  if (!face) {
    return res.status(404).json({
      success: false,
      error: "Visage non trouve",
    });
  }

  res.json({ success: true, message: `Visage "${face.name}" supprime` });
});

const syncFaces = asyncHandler(async (req, res) => {
  const { files } = req.body;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({
      success: false,
      error: 'Le champ "files" (tableau) est requis.',
    });
  }

  const results = { created: [], alreadyExists: [], deactivated: [] };

  for (const fileName of files) {
    const existing = await AuthorizedFace.findOne({ fileName });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      results.alreadyExists.push(fileName);
    } else {
      const name = fileName.replace(/\.[^.]+$/, "");
      await AuthorizedFace.create({ name, fileName });
      results.created.push(fileName);
    }
  }

  const deactivated = await AuthorizedFace.updateMany(
    { fileName: { $nin: files }, isActive: true },
    { isActive: false }
  );
  results.deactivated = deactivated.modifiedCount;

  res.json({ success: true, data: results });
});

module.exports = {
  getFaces,
  getFaceById,
  createFace,
  updateFace,
  deleteFace,
  syncFaces,
};
