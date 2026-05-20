import { Router } from 'express';
import {
  createPet,
  deletePet,
  getPetById,
  getPets,
  updatePet,
} from '../controllers/pets.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import { createPetSchema, updatePetSchema } from '../validation/pet.schemas';

const router = Router();

router.get('/', getPets);
router.get('/:id', getPetById);
router.post('/', authMiddleware, validateSchema(createPetSchema), createPet);
router.put('/:id', authMiddleware, validateSchema(updatePetSchema), updatePet);
router.delete('/:id', authMiddleware, deletePet);

export default router;
