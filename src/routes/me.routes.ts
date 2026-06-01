import { Router } from 'express';
import { updateCurrentUser } from '../controllers/auth.controller';
import { getMyPets } from '../controllers/pets.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import { updateCurrentUserSchema } from '../validation/auth.schemas';

const router = Router();

router.put(
  '/',
  authMiddleware,
  validateSchema(updateCurrentUserSchema),
  updateCurrentUser,
);
router.get('/pets', authMiddleware, getMyPets);

export default router;
