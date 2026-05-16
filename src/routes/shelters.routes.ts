import { Router } from 'express';

import {
  createShelter,
  getShelterById,
  getShelters,
} from '../controllers/shelters.controller';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();

router.get('/', getShelters);
router.get('/:id', getShelterById);
router.post(
  '/',
  validateBody([
    { field: 'name', message: 'Name is required' },
    { field: 'email', message: 'A valid email is required', validate: (value) => typeof value === 'string' && value.includes('@') },
    { field: 'phone', message: 'Phone is required' },
    { field: 'address', message: 'Address is required' },
    { field: 'description', message: 'Description is required' },
  ]),
  createShelter,
);

export default router;
