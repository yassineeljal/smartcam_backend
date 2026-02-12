require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../config");
const { AuthorizedFace, SystemStatus } = require("../models");

const seed = async () => {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log("MongoDB connecte pour le seed");

    await SystemStatus.findByIdAndUpdate(
      "smartcam_status",
      {
        _id: "smartcam_status",
        isOnline: false,
        pirStatus: { isAvailable: false },
        chestStatus: { isAvailable: false },
        cameraStatus: { isConnected: false },
        recognition: { isProcessing: false, progress: 0 },
        stats: {
          totalFramesProcessed: 0,
          totalFacesDetected: 0,
          totalAccessGranted: 0,
          totalAccessDenied: 0,
          totalMotions: 0,
        },
      },
      { upsert: true }
    );
    console.log("SystemStatus initialise");

    const faces = [
      { name: "Yassi", fileName: "yassi.jpg" },
    ];

    for (const face of faces) {
      const exists = await AuthorizedFace.findOne({ fileName: face.fileName });
      if (!exists) {
        await AuthorizedFace.create(face);
        console.log(`   Visage ajoute : ${face.name}`);
      } else {
        console.log(`   Visage deja existant : ${face.name}`);
      }
    }

    console.log("\nSeed termine avec succes !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur seed :", error);
    process.exit(1);
  }
};

seed();
