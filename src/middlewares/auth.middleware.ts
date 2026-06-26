import { NextFunction, Request, Response } from 'express';
import { buildErrorResponse } from '../utils/api-response';
import { verifyJwtToken } from '../utils/auth';

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyJwtToken(token);
      req.userId = payload.userId;
      req.role = payload.role;
    } catch {
      // invalid token — treat as unauthenticated
    }
  }

  next();
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(buildErrorResponse('No token provided'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyJwtToken(token);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch {
    res.status(401).json(buildErrorResponse('Invalid or expired token'));
  }
};
