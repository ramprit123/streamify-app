import { validationResult } from 'express-validator';

// Standard response structure
const createResponse = (success, message, data = null, errors = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data) response.data = data;
  if (errors) response.errors = errors;
  return response;
};

// Success response handler
export const successResponse = (req, res, next) => {
  res.success = (data, message = 'Operation successful') => {
    res.status(200).json(createResponse(true, message, data));
  };

  res.created = (data, message = 'Resource created successfully') => {
    res.status(201).json(createResponse(true, message, data));
  };

  next();
};

// Error response handler
export const errorResponse = (req, res, next) => {
  res.error = (message, statusCode = 400) => {
    res.status(statusCode).json(createResponse(false, message));
  };

  res.validationError = (errors) => {
    res.status(422).json(createResponse(false, 'Validation failed', null, errors));
  };

  next();
};

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    return res.validationError(formattedErrors);
  }
  next();
};