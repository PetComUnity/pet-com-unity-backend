import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
import { authService } from '../services/auth.service';

export const register = asyncHandler(async (req, res) => {
  const authResult = await authService.register(req.body);

  sendSuccess(res, 201, 'User registered successfully', authResult);
});

export const login = asyncHandler(async (req, res) => {
  const authResult = await authService.login(req.body);

  sendSuccess(res, 200, 'User logged in successfully', authResult);
});

export const getCurrentUser = asyncHandler(async (_req, res) => {
  const user = await authService.getCurrentUser();

  sendSuccess(res, 200, 'Current user fetched successfully', user);
});
