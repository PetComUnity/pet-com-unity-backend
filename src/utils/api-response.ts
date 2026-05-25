import { Response } from 'express';

import { ApiResponse, AppError } from '../types/api-response';

export const buildSuccessResponse = <T, TMeta = unknown>(
  message: string,
  data?: T,
  meta?: TMeta,
): ApiResponse<T, TMeta> => {
  const response: ApiResponse<T, TMeta> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (meta !== undefined) {
    response.meta = meta;
  }

  return response;
};

export const buildErrorResponse = (message: string): ApiResponse => {
  return {
    success: false,
    message,
  };
};

export const sendSuccess = <T, TMeta = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: TMeta,
): Response<ApiResponse<T, TMeta>> => {
  return res.status(statusCode).json(buildSuccessResponse(message, data, meta));
};

export const createAppError = (message: string, statusCode = 500): AppError => {
  return Object.assign(new Error(message), { statusCode });
};
