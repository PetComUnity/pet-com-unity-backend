import { Router } from 'express';
import {
  createShelter,
  getShelterById,
  getShelters,
} from '../controllers/shelters.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import { createShelterSchema } from '../validation/shelter.schemas';

const router = Router();

router.get('/', getShelters);
router.get('/:id', getShelterById);
router.post(
  '/',
  authMiddleware,
  validateSchema(createShelterSchema),
  createShelter,
);

export default router;
