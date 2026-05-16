import { Router } from 'express';

import { getCurrentUser, login, register } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { UserRole } from '../types/user';

const router = Router();

const userRoles: UserRole[] = ['pet_owner', 'vet', 'shelter', 'admin'];

router.post(
  '/register',
  validateBody([
    { field: 'name', message: 'Name is required' },
    { field: 'email', message: 'A valid email is required', validate: (value) => typeof value === 'string' && value.includes('@') },
    { field: 'password', message: 'Password must be at least 6 characters long', validate: (value) => typeof value === 'string' && value.length >= 6 },
    {
      field: 'role',
      message: 'Role must be one of: pet_owner, vet, shelter, admin',
      validate: (value) => typeof value === 'string' && userRoles.includes(value as UserRole),
    },
  ]),
  register,
);

router.post(
  '/login',
  validateBody([
    { field: 'email', message: 'A valid email is required', validate: (value) => typeof value === 'string' && value.includes('@') },
    { field: 'password', message: 'Password is required' },
  ]),
  login,
);

router.get('/me', getCurrentUser);

export default router;
