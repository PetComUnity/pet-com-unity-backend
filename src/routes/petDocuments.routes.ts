import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  addPetDocument,
  deletePetDocument,
  getPetDocuments,
} from '../controllers/petDocuments.controller';

const router = Router({ mergeParams: true });

router.get('/', authMiddleware, getPetDocuments);
router.post('/', authMiddleware, addPetDocument);
router.delete('/:docId', authMiddleware, deletePetDocument);

export default router;
