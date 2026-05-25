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
