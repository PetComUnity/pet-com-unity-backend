import { Router } from 'express';
import {
  createShelter,
  getShelterById,
  getShelters,
} from '../controllers/shelters.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import { createShelterSchema } from '../validation/shelter.schemas';

const router = Router();

router.get('/', getShelters);
router.get('/:id', getShelterById);
router.post(
  '/',
  authMiddleware,
  requireRole(['shelter', 'admin']),
  validateSchema(createShelterSchema),
  createShelter,
);

export default router;
