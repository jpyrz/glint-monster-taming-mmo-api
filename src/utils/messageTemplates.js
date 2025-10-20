const MESSAGE_TYPES = {
  NOTIFICATION: "NOTIFICATION",
  UPDATE: "UPDATE",
  ALERT: "ALERT",
  REMINDER: "REMINDER",
};

const MESSAGE_TEMPLATES = {
  [MESSAGE_TYPES.NOTIFICATION]: (data) => ({
    title: data.title || "Notification",
    body: data.body || "You have a new notification",
    data: {
      type: MESSAGE_TYPES.NOTIFICATION,
      ...data.customData,
    },
  }),

  [MESSAGE_TYPES.UPDATE]: (data) => ({
    title: data.title || "Update Available",
    body: data.body || "Something has been updated",
    data: {
      type: MESSAGE_TYPES.UPDATE,
      ...data.customData,
    },
  }),

  [MESSAGE_TYPES.ALERT]: (data) => ({
    title: data.title || "Alert!",
    body: data.body || "Something needs your attention",
    data: {
      type: MESSAGE_TYPES.ALERT,
      priority: "high",
      ...data.customData,
    },
  }),

  [MESSAGE_TYPES.REMINDER]: (data) => ({
    title: data.title || "Reminder",
    body: data.body || "Don't forget!",
    data: {
      type: MESSAGE_TYPES.REMINDER,
      ...data.customData,
    },
  }),
};

const createMessage = (messageType, data) => {
  const template = MESSAGE_TEMPLATES[messageType];
  if (!template) {
    throw new Error(`Unknown message type: ${messageType}`);
  }
  return template(data);
};

module.exports = {
  MESSAGE_TYPES,
  MESSAGE_TEMPLATES,
  createMessage,
};
