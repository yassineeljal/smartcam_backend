const { Server } = require("socket.io");
const config = require("../config");

const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origins.includes("*") ? "*" : config.cors.origins,
      methods: ["GET", "POST"],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  let clientCount = 0;

  io.on("connection", (socket) => {
    clientCount++;
    console.log(
      `Client connecte : ${socket.id} (${clientCount} client(s) en ligne)`
    );

    socket.emit("welcome", {
      message: "Connecte au serveur SmartCam",
      socketId: socket.id,
      timestamp: new Date(),
    });

    socket.on("subscribe", (eventTypes) => {
      if (Array.isArray(eventTypes)) {
        eventTypes.forEach((type) => {
          socket.join(type);
        });
      }
    });

    socket.on("unsubscribe", (eventTypes) => {
      if (Array.isArray(eventTypes)) {
        eventTypes.forEach((type) => {
          socket.leave(type);
        });
      }
    });

    socket.on("request_status", async () => {
      try {
        const { SystemStatus } = require("../models");
        const status = await SystemStatus.findById("smartcam_status").lean();
        socket.emit("status_update", status || { isOnline: false });
      } catch (error) {
        socket.emit("status_update", { isOnline: false, error: error.message });
      }
    });

    socket.on("disconnect", (reason) => {
      clientCount--;
      console.log(
        `Client deconnecte : ${socket.id} (raison: ${reason}) (${clientCount} client(s) en ligne)`
      );
    });
  });

  console.log("Socket.IO initialise");

  return io;
};

module.exports = setupSocketIO;
