import { Router } from 'express';
import {
  getCurrentUser,
  login,
  logout,
  register,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import { loginSchema, registerSchema } from '../validation/auth.schemas';

const router = Router();

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

export default router;
