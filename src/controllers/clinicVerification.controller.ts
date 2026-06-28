import type { AuthRequest } from '../middlewares/auth.middleware';
import { clinicVerificationService } from '../services/clinicVerification.service';
import { asyncHandler } from '../utils/async-handler';
import { createAppError, sendSuccess } from '../utils/api-response';
import { lookupPetByMicrochipQuerySchema } from '../validation/clinicVerification.schema';

export const lookupPetByMicrochip = asyncHandler(
  async (req: AuthRequest, res) => {
    const result = lookupPetByMicrochipQuerySchema.safeParse(req.query);

    if (!result.success) {
      throw createAppError(
        result.error.issues[0]?.message ?? 'Invalid query parameters',
        400,
      );
    }

    const pet = await clinicVerificationService.lookupPetByMicrochipId(
      result.data.microchipId,
    );

    res.set('Cache-Control', 'no-store');
    sendSuccess(res, 200, 'Pet verification lookup loaded', pet);
  },
);

export const submitPetVerification = asyncHandler(
  async (req: AuthRequest, res) => {
    const result = await clinicVerificationService.submitVerificationDecision(
      req.params.petId,
      req.userId!,
      req.body,
    );

    sendSuccess(res, 201, 'Pet verification recorded successfully', result);
  },
);

export const getPetVerificationHistory = asyncHandler(
  async (req: AuthRequest, res) => {
    const history = await clinicVerificationService.getVerificationHistory(
      req.params.petId,
    );

    sendSuccess(
      res,
      200,
      'Pet verification history fetched successfully',
      history,
    );
  },
);
