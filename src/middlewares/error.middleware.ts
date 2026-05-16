import { ErrorRequestHandler } from 'express';

import { AppError } from '../types/api-response';
import { buildErrorResponse } from '../utils/api-response';

export const errorMiddleware: ErrorRequestHandler = (error: AppError, _req, res, _next) => {
  const statusCode = error.statusCode ?? 500;
  const message = error.message || 'Internal server error';

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json(buildErrorResponse(message));
};
