import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodSchema } from 'zod';
import { buildErrorResponse } from '../utils/api-response';

export const validateSchema = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      res.status(400).json(buildErrorResponse(firstError.message));
      return;
    }

    req.body = result.data;
    next();
  };
};
