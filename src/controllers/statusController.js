const asyncHandler = require("../middlewares/asyncHandler");
const { SystemStatus } = require("../models");

const getStatus = asyncHandler(async (req, res) => {
  let status = await SystemStatus.findById("smartcam_status").lean();

  if (!status) {
    status = await SystemStatus.create({ _id: "smartcam_status" });
    status = status.toObject();
  }

  const now = new Date();
  const lastHB = status.lastHeartbeat ? new Date(status.lastHeartbeat) : null;
  const isActuallyOnline = lastHB && now - lastHB < 30000;

  if (status.isOnline && !isActuallyOnline) {
    await SystemStatus.findByIdAndUpdate("smartcam_status", {
      isOnline: false,
    });
    status.isOnline = false;
  }

  if (status.stats && status.stats.startedAt && status.isOnline) {
    status.stats.uptimeSeconds = Math.floor(
      (now - new Date(status.stats.startedAt)) / 1000
    );
  }

  res.json({ success: true, data: status });
});

const getQuickStatus = asyncHandler(async (req, res) => {
  const status = await SystemStatus.findById("smartcam_status")
    .select("isOnline lastHeartbeat recognition chestStatus pirStatus")
    .lean();

  if (!status) {
    return res.json({
      success: true,
      data: { isOnline: false, recognition: null },
    });
  }

  const now = new Date();
  const lastHB = status.lastHeartbeat ? new Date(status.lastHeartbeat) : null;
  const isActuallyOnline = lastHB && now - lastHB < 30000;

  res.json({
    success: true,
    data: {
      isOnline: isActuallyOnline,
      lastHeartbeat: status.lastHeartbeat,
      recognition: status.recognition,
      chestStatus: status.chestStatus,
      pirStatus: status.pirStatus,
    },
  });
});

module.exports = {
  getStatus,
  getQuickStatus,
};
