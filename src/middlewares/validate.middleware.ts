import { NextFunction, Request, RequestHandler, Response } from 'express';

import { buildErrorResponse } from '../utils/api-response';

type ValidationRule = {
  field: string;
  message: string;
  validate?: (value: unknown) => boolean;
};

const isMissingValue = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return true;
  }

  return typeof value === 'string' && value.trim() === '';
};

export const validateBody = (rules: ValidationRule[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const rule of rules) {
      const value = req.body[rule.field];

      if (isMissingValue(value)) {
        res.status(400).json(buildErrorResponse(rule.message));
        return;
      }

      if (rule.validate && !rule.validate(value)) {
        res.status(400).json(buildErrorResponse(rule.message));
        return;
      }
    }

    next();
  };
};
