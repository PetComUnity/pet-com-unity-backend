import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadDocument, uploadImage } from '../middlewares/upload.middleware';
import { uploadDocumentController, uploadImageController } from '../controllers/upload.controller';

const router = Router();

router.post('/image', authMiddleware, uploadImage, uploadImageController);
router.post('/document', authMiddleware, uploadDocument, uploadDocumentController);

export default router;
