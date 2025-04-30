import SystemLog from '../models/SystemLog.js';

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
      userAgent: req?.headers?.['user-agent'],
    };

    const systemLog = await SystemLog.create(logData);
    return systemLog;
  } catch (error) {
    console.error('Error logging system activity:', error);
    // Don't throw the error to prevent disrupting the main application flow
    return null;
  }
};