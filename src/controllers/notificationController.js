const asyncHandler = require("../middlewares/asyncHandler");
const { Notification } = require("../models");

const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, unreadOnly, type } = req.query;

  const filter = {};
  if (unreadOnly === "true") filter.isRead = false;
  if (type) filter.type = type;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ isRead: false }),
  ]);

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasMore: skip + notifications.length < total,
    },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: "Notification non trouvee",
    });
  }

  res.json({ success: true, data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    modifiedCount: result.modifiedCount,
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ isRead: false });

  res.json({ success: true, unreadCount: count });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: "Notification non trouvee",
    });
  }

  res.json({ success: true, message: "Notification supprimee" });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
