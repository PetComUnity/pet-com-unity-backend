import { Router } from 'express';
import {
  createShelter,
  getMyShelter,
  getShelterById,
  getShelters,
  updateMyShelter,
} from '../controllers/shelters.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import { createShelterSchema } from '../validation/shelter.schemas';

const router = Router();

router.get('/', getShelters);
router.get('/me', authMiddleware, getMyShelter);
router.get('/:id', getShelterById);

router.post(
  '/',
  authMiddleware,
  requireRole(['shelter', 'admin']),
  validateSchema(createShelterSchema),
  createShelter,
);

router.patch(
  '/',
  authMiddleware,
  requireRole(['shelter', 'admin']),
  updateMyShelter,
);

export default router;
