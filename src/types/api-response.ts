import { Response } from 'express';

export interface ApiResponse<T = unknown, TMeta = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: TMeta;
}

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

// Add this: Explicitly type the res parameter
export const sendSuccess = <T>(res: Response, code: number, message: string, data: T): void => {
  res.status(code).json({ success: true, message, data });
};