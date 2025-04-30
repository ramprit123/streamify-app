import { emitSystemEvent, EVENT_TYPES } from '../utils/eventEmitter.js';
import { logSystemActivity } from '../utils/logger.js';

export const loggingMiddleware = async (req, res, next) => {
  // Store the original send and json methods
  const originalSend = res.send;
  const originalJson = res.json;
  const startTime = Date.now();

  // Create a log entry for the request
  const requestLog = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };

  // Override send
  res.send = function (body) {
    const responseTime = Date.now() - startTime;
    const responseLog = {
      ...requestLog,
      responseTime,
      statusCode: res.statusCode,
      responseBody: body,
    };

    // Emit event for logging
    emitSystemEvent(EVENT_TYPES.SYSTEM_ACTION, {
      action: 'HTTP_REQUEST',
      data: responseLog,
    });

    // If user is authenticated, log the activity
    if (req.user) {
      logSystemActivity({
        user: req.user,
        action: 'HTTP_REQUEST',
        entityType: 'Request',
        entityId: req.url,
        currentState: responseLog,
        req,
      }).catch(console.error);
    }

    return originalSend.call(this, body);
  };

  // Override json
  res.json = function (body) {
    const responseTime = Date.now() - startTime;
    const responseLog = {
      ...requestLog,
      responseTime,
      statusCode: res.statusCode,
      responseBody: body,
    };

    // Emit event for logging
    emitSystemEvent(EVENT_TYPES.SYSTEM_ACTION, {
      action: 'HTTP_REQUEST',
      data: responseLog,
    });

    // If user is authenticated, log the activity
    if (req.user) {
      logSystemActivity({
        user: req.user,
        action: 'HTTP_REQUEST',
        entityType: 'Request',
        entityId: req.url,
        currentState: responseLog,
        req,
      }).catch(console.error);
    }

    return originalJson.call(this, body);
  };

  next();
};