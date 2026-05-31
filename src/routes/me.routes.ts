import { Router } from 'express';
import { getMyPets } from '../controllers/pets.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/pets', authMiddleware, getMyPets);

export default router;
