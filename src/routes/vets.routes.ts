import { Router } from 'express';

import { createVet, getVetById, getVets } from '../controllers/vets.controller';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();

router.get('/', getVets);
router.get('/:id', getVetById);
router.post(
  '/',
  validateBody([
    { field: 'name', message: 'Name is required' },
    { field: 'clinicName', message: 'Clinic name is required' },
    { field: 'email', message: 'A valid email is required', validate: (value) => typeof value === 'string' && value.includes('@') },
    { field: 'phone', message: 'Phone is required' },
    { field: 'address', message: 'Address is required' },
    { field: 'specialization', message: 'Specialization is required' },
  ]),
  createVet,
);

export default router;
