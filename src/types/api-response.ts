export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}
