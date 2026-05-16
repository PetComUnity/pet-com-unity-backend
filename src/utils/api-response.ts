import { Response } from 'express';

import { ApiResponse, AppError } from '../types/api-response';

export const buildSuccessResponse = <T>(message: string, data?: T): ApiResponse<T> => {
  if (data === undefined) {
    return {
      success: true,
      message,
    };
  }

  return {
    success: true,
    message,
    data,
  };
};

export const buildErrorResponse = (message: string): ApiResponse => {
  return {
    success: false,
    message,
  };
};

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json(buildSuccessResponse(message, data));
};

export const createAppError = (message: string, statusCode = 500): AppError => {
  return Object.assign(new Error(message), { statusCode });
};
