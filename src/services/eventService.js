const { Event, SystemStatus, AuthorizedFace } = require("../models");
const { sendNotification } = require("./notificationService");

let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

const emitAndSave = async (type, data = {}, options = {}) => {
  const event = await Event.create({
    type,
    data,
    pythonTimestamp: options.pythonTimestamp || null,
  });

  if (io) {
    io.emit("event", {
      id: event._id,
      type,
      data,
      createdAt: event.createdAt,
    });

    io.emit(type, {
      id: event._id,
      ...data,
      createdAt: event.createdAt,
    });
  }

  return event;
};

const processEvent = async (type, data = {}, options = {}) => {
  const event = await emitAndSave(type, data, options);

  const statusUpdate = { lastHeartbeat: new Date(), isOnline: true };

  switch (type) {
    case "motion_detected":
      statusUpdate["pirStatus.isActive"] = true;
      statusUpdate["pirStatus.lastMotionAt"] = new Date();
      statusUpdate.$inc = { "stats.totalMotions": 1 };

      await sendNotification({
        title: "Mouvement detecte",
        body: "Le capteur PIR a detecte un mouvement devant la camera.",
        type: "motion_detected",
        payload: { pirActive: true },
        eventId: event._id,
      });
      break;

    case "face_detected":
      statusUpdate["cameraStatus.lastFrameAt"] = new Date();
      statusUpdate.$inc = { "stats.totalFacesDetected": data.facesCount || 1 };

      await sendNotification({
        title: "Visage detecte",
        body: `${data.facesCount || 1} visage(s) detecte(s) devant la camera.`,
        type: "face_detected",
        payload: { facesCount: data.facesCount },
        eventId: event._id,
      });
      break;

    case "recognition_start":
      statusUpdate["recognition.isProcessing"] = true;
      statusUpdate["recognition.progress"] = 0;
      statusUpdate["recognition.currentStep"] = "Demarrage...";
      statusUpdate["recognition.totalComparisons"] =
        data.totalComparisons || 0;
      statusUpdate["recognition.currentComparison"] = 0;
      break;

    case "recognition_progress":
      statusUpdate["recognition.progress"] = data.progress || 0;
      statusUpdate["recognition.currentStep"] =
        data.comparedWith || "En cours...";
      statusUpdate["recognition.currentComparison"] =
        data.currentComparison || 0;
      break;

    case "access_granted":
      statusUpdate["recognition.isProcessing"] = false;
      statusUpdate["recognition.progress"] = 100;
      statusUpdate["recognition.currentStep"] = "Termine";
      statusUpdate.$inc = {
        ...statusUpdate.$inc,
        "stats.totalAccessGranted": 1,
      };

      if (data.personName) {
        await AuthorizedFace.findOneAndUpdate(
          {
            name: { $regex: new RegExp(`^${data.personName}$`, "i") },
          },
          {
            $inc: { "stats.totalRecognitions": 1 },
            "stats.lastRecognizedAt": new Date(),
          }
        );
      }

      await sendNotification({
        title: "Acces autorise",
        body: `${data.personName || "Personne autorisee"} a ete reconnu(e). Coffre en cours d'ouverture.`,
        type: "access_granted",
        payload: {
          personName: data.personName,
          distance: data.distance,
        },
        eventId: event._id,
      });
      break;

    case "access_denied":
      statusUpdate["recognition.isProcessing"] = false;
      statusUpdate["recognition.progress"] = 100;
      statusUpdate["recognition.currentStep"] = "Termine";
      statusUpdate.$inc = {
        ...statusUpdate.$inc,
        "stats.totalAccessDenied": 1,
      };

      await sendNotification({
        title: "Acces refuse",
        body: "Un visage inconnu a ete detecte devant la camera.",
        type: "access_denied",
        payload: { snapshot: data.snapshot || null },
        eventId: event._id,
      });
      break;

    case "chest_opened":
      statusUpdate["chestStatus.isOpen"] = true;
      statusUpdate["chestStatus.lastOpenedAt"] = new Date();

      await sendNotification({
        title: "Coffre ouvert",
        body: "Le coffre a ete ouvert automatiquement.",
        type: "chest_opened",
        eventId: event._id,
      });
      break;

    case "chest_closed":
      statusUpdate["chestStatus.isOpen"] = false;
      statusUpdate["chestStatus.lastClosedAt"] = new Date();

      await sendNotification({
        title: "Coffre ferme",
        body: "Le coffre s'est referme automatiquement.",
        type: "chest_closed",
        eventId: event._id,
      });
      break;

    case "system_start":
      statusUpdate.isOnline = true;
      statusUpdate["stats.startedAt"] = new Date();
      statusUpdate["pirStatus.isAvailable"] = data.pirActive !== undefined;
      statusUpdate["chestStatus.isAvailable"] = data.chestOpen !== undefined;
      statusUpdate["cameraStatus.isConnected"] = true;
      statusUpdate["cameraStatus.url"] = data.cameraUrl || null;
      statusUpdate.authorizedFacesCount = data.authorizedFacesCount || 0;

      await sendNotification({
        title: "Systeme demarre",
        body: "SmartCam est en ligne et surveille.",
        type: "system_alert",
        eventId: event._id,
      });
      break;

    case "system_stop":
      statusUpdate.isOnline = false;
      statusUpdate["recognition.isProcessing"] = false;

      await sendNotification({
        title: "Systeme arrete",
        body: "SmartCam s'est arrete.",
        type: "system_alert",
        eventId: event._id,
      });
      break;

    case "error":
      await sendNotification({
        title: "Erreur systeme",
        body: data.errorMessage || "Une erreur est survenue.",
        type: "system_alert",
        payload: { errorMessage: data.errorMessage },
        eventId: event._id,
      });
      break;
  }

  const { $inc, ...setFields } = statusUpdate;
  const updateOp = { $set: setFields };
  if ($inc) updateOp.$inc = $inc;

  await SystemStatus.findByIdAndUpdate("smartcam_status", updateOp, {
    upsert: true,
    new: true,
  });

  return event;
};

const heartbeat = async (data = {}) => {
  await SystemStatus.findByIdAndUpdate(
    "smartcam_status",
    {
      $set: {
        isOnline: true,
        lastHeartbeat: new Date(),
        "cameraStatus.lastFrameAt": new Date(),
        "cameraStatus.isConnected": true,
      },
      $inc: {
        "stats.totalFramesProcessed": 1,
      },
    },
    { upsert: true }
  );

  if (io) {
    io.emit("heartbeat", {
      timestamp: new Date(),
      frameNumber: data.frameNumber,
      facesCount: data.facesCount,
    });
  }
};

module.exports = {
  setIO,
  processEvent,
  heartbeat,
};
