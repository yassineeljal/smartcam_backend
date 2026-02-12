const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");

const config = require("./config");
const connectDB = require("./config/database");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const setupSocketIO = require("./socket");
const { setIO } = require("./services/eventService");
const { setIO: setNotifIO } = require("./services/notificationService");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: config.cors.origins.includes("*") ? "*" : config.cors.origins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    name: "SmartCam API",
    version: "1.0.0",
    description: "Backend API pour systeme de reconnaissance faciale SmartCam",
    endpoints: {
      health: "GET /api/health",
      status: "GET /api/status",
      events: "GET /api/events",
      notifications: "GET /api/notifications",
      faces: "GET /api/faces",
      python: "POST /api/python/event (requires x-api-key)",
    },
    websocket: "Socket.IO sur le meme port",
  });
});

app.use(errorHandler);

const start = async () => {
  await connectDB();

  const io = setupSocketIO(server);
  setIO(io);
  setNotifIO(io);

  server.listen(config.port, () => {
    console.log(`\nSmartCam API demarre sur le port ${config.port}`);
    console.log(`   REST API : http://localhost:${config.port}/api`);
    console.log(`   Socket.IO : ws://localhost:${config.port}`);
    console.log(`   Environnement : ${config.nodeEnv}\n`);
  });
};

start().catch((err) => {
  console.error("Impossible de demarrer le serveur :", err);
  process.exit(1);
});
