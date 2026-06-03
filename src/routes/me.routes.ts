import { Router } from 'express';
import {
  changePassword,
  updateCurrentUser,
} from '../controllers/auth.controller';
import { getMyPets } from '../controllers/pets.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import {
  changePasswordSchema,
  updateCurrentUserSchema,
} from '../validation/auth.schemas';

const router = Router();

router.put(
  '/',
  authMiddleware,
  validateSchema(updateCurrentUserSchema),
  updateCurrentUser,
);
router.put(
  '/password',
  authMiddleware,
  validateSchema(changePasswordSchema),
  changePassword,
);
router.get('/pets', authMiddleware, getMyPets);

export default router;
