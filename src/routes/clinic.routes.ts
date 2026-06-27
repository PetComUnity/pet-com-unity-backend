import { Router } from 'express';

import {
  createClinic,
  getClinics,
  getClinicById,
  updateMyClinic,
  deleteMyClinic,
  getMyClinic,
} from '../controllers/clinic.controller';
import {
  getPetVerificationHistory,
  lookupPetByMicrochip,
  submitPetVerification,
} from '../controllers/clinicVerification.controller';

import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateSchema } from '../middlewares/validate-schema.middleware';
import { submitPetVerificationSchema } from '../validation/clinicVerification.schema';

const router = Router();

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */

// Get all clinics
router.get('/', getClinics);

router.get(
  '/pets/lookup',
  authMiddleware,
  requireRole(['vet', 'admin']),
  lookupPetByMicrochip,
);

router.post(
  '/pets/:petId/verify',
  authMiddleware,
  requireRole(['vet', 'admin']),
  validateSchema(submitPetVerificationSchema),
  submitPetVerification,
);

router.get(
  '/pets/:petId/verifications',
  authMiddleware,
  requireRole(['vet', 'admin']),
  getPetVerificationHistory,
);

/**
 * =========================
 * VET ONLY ROUTES
 * =========================
 */

// Create clinic for logged-in vet
router.post('/', authMiddleware, requireRole('vet'), createClinic);

router.get('/me', authMiddleware, getMyClinic);

// Update clinic by userId (from auth token)
router.patch('/', authMiddleware, requireRole('vet'), updateMyClinic);

// Delete clinic by userId (from auth token)
router.delete('/', authMiddleware, requireRole('vet'), deleteMyClinic);

// Get clinic by ID
router.get('/:id', getClinicById);

export default router;
