import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { uploadImageController } from '../controllers/upload.controller';

const router = Router();

router.post('/image', authMiddleware, uploadImage, uploadImageController);

export default router;
