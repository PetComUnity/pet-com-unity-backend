import { adminService } from '../services/admin.service';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';

export const getAdminUsers = asyncHandler(async (_req, res) => {
  const users = await adminService.getUsers();
  sendSuccess(res, 200, 'Users fetched successfully', users);
});
