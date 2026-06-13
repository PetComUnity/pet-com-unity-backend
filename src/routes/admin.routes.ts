import { Router } from 'express';
import { getAdminUsers } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.get('/users', authMiddleware, requireRole(['admin']), getAdminUsers);

export default router;
