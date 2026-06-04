import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getPrivateFileController } from '../controllers/files.controller';

const router = Router();

router.get('/:fileId', authMiddleware, getPrivateFileController);

export default router;
