import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';

export const getHealthStatus = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, 'Backend is running');
});
