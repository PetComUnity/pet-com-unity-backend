import { RequestHandler } from 'express';

import { buildErrorResponse } from '../utils/api-response';

export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(404).json(buildErrorResponse(`Route ${req.originalUrl} not found`));
};
