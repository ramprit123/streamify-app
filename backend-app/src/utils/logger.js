import SystemLog from '../models/SystemLog.js';
import { emitSystemEvent, EVENT_TYPES } from "./eventEmitter.js";

export const logSystemActivity = async ({
  user,
  action,
  entityType,
  entityId,
  previousState = null,
  currentState = null,
  req = null,
}) => {
  try {
    const logData = {
      user: user._id,
      action,
      entityType,
      entityId,
      previousState,
      currentState,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    };

    const systemLog = await SystemLog.create(logData);

    // Emit event for the logged activity
    emitSystemEvent(EVENT_TYPES.USER_ACTION, {
      action,
      entityType,
      entityId,
      userId: user._id,
      timestamp: systemLog.createdAt,
    });

    return systemLog;
  } catch (error) {
    console.error("Error logging system activity:");
    // console.error("Error logging system activity:", error);
    return null;
  }
};