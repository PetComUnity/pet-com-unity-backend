import { Router } from 'express';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { getPrivateFileController } from '../controllers/files.controller';

const router = Router();

router.get('/:fileId', optionalAuthMiddleware, getPrivateFileController);

export default router;
