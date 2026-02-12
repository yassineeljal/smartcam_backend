const { Notification } = require("../models");

let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

const sendNotification = async ({
  title,
  body,
  type,
  payload = {},
  eventId = null,
}) => {
  const notification = await Notification.create({
    title,
    body,
    type,
    payload,
    eventId,
  });

  if (io) {
    io.emit("notification", {
      id: notification._id,
      title,
      body,
      type,
      payload,
      eventId,
      createdAt: notification.createdAt,
    });
  }

  console.log(`Notification in-app : [${type}] ${title}`);

  return notification;
};

module.exports = {
  setIO,
  sendNotification,
};
