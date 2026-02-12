const asyncHandler = require("../middlewares/asyncHandler");
const { Event } = require("../models");

const getEvents = asyncHandler(async (req, res) => {
  const {
    type,
    types,
    page = 1,
    limit = 50,
    from,
    to,
    sort = "desc",
  } = req.query;

  const filter = {};

  if (type) {
    filter.type = type;
  } else if (types) {
    filter.type = { $in: types.split(",").map((t) => t.trim()) };
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = sort === "asc" ? 1 : -1;

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Event.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: events,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasMore: skip + events.length < total,
    },
  });
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).lean();

  if (!event) {
    return res.status(404).json({
      success: false,
      error: "Evenement non trouve",
    });
  }

  res.json({ success: true, data: event });
});

const getEventStats = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const dateFilter = {};
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.$gte = new Date(from);
    if (to) dateFilter.createdAt.$lte = new Date(to);
  }

  const stats = await Event.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        lastOccurrence: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const summary = {};
  let totalEvents = 0;
  stats.forEach((s) => {
    summary[s._id] = {
      count: s.count,
      lastOccurrence: s.lastOccurrence,
    };
    totalEvents += s.count;
  });

  res.json({
    success: true,
    data: {
      totalEvents,
      byType: summary,
    },
  });
});

const deleteEvents = asyncHandler(async (req, res) => {
  const { before, type } = req.query;
  const filter = {};

  if (before) {
    filter.createdAt = { $lt: new Date(before) };
  }
  if (type) {
    filter.type = type;
  }

  if (Object.keys(filter).length === 0) {
    return res.status(400).json({
      success: false,
      error:
        'Au moins un filtre est requis (before ou type) pour eviter une suppression totale.',
    });
  }

  const result = await Event.deleteMany(filter);

  res.json({
    success: true,
    deletedCount: result.deletedCount,
  });
});

module.exports = {
  getEvents,
  getEventById,
  getEventStats,
  deleteEvents,
};
