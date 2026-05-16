import { Router } from 'express';

import {
  createPet,
  deletePet,
  getPetById,
  getPets,
  updatePet,
} from '../controllers/pets.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { PetGender, PetStatus } from '../types/pet';

const router = Router();

const petStatuses: PetStatus[] = ['owned', 'lost', 'found', 'adoption'];
const petGenders: PetGender[] = ['male', 'female', 'unknown'];

const petValidationRules = [
  { field: 'name', message: 'Name is required' },
  { field: 'species', message: 'Species is required' },
  { field: 'breed', message: 'Breed is required' },
  { field: 'age', message: 'Age must be a number greater than or equal to 0', validate: (value: unknown) => typeof value === 'number' && value >= 0 },
  {
    field: 'gender',
    message: 'Gender must be one of: male, female, unknown',
    validate: (value: unknown) => typeof value === 'string' && petGenders.includes(value as PetGender),
  },
  { field: 'description', message: 'Description is required' },
  { field: 'photoUrl', message: 'Photo URL is required' },
  { field: 'ownerId', message: 'Owner ID is required' },
  {
    field: 'status',
    message: 'Status must be one of: owned, lost, found, adoption',
    validate: (value: unknown) => typeof value === 'string' && petStatuses.includes(value as PetStatus),
  },
];

router.get('/', getPets);
router.get('/:id', getPetById);
router.post('/', validateBody(petValidationRules), createPet);
router.put('/:id', validateBody(petValidationRules), updatePet);
router.delete('/:id', deletePet);

export default router;
