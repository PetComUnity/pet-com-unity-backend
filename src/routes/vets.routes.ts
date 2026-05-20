import { Router } from 'express';
import { createVet, getVetById, getVets } from '../controllers/vets.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import { createVetSchema } from '../validation/vet.schemas';

const router = Router();

router.get('/', getVets);
router.get('/:id', getVetById);
router.post('/', authMiddleware, validateSchema(createVetSchema), createVet);

export default router;
