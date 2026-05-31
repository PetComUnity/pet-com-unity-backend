import { asyncHandler } from '../utils/async-handler';
import { createAppError, sendSuccess } from '../utils/api-response';
import { petsService } from '../services/pets.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getPetsQuerySchema } from '../validation/pet.schemas';

export const getPets = asyncHandler(async (req, res) => {
  const result = getPetsQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw createAppError(result.error.issues[0]?.message ?? 'Invalid query parameters', 400);
  }

  const pets = await petsService.getAllPets(result.data);
  sendSuccess(res, 200, 'Pets fetched successfully', pets.items, pets.pagination);
});

export const getMyPets = asyncHandler(async (req: AuthRequest, res) => {
  const result = getPetsQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw createAppError(result.error.issues[0]?.message ?? 'Invalid query parameters', 400);
  }

  const pets = await petsService.getMyPets(req.userId!, result.data);
  sendSuccess(res, 200, 'My pets fetched successfully', pets.items, pets.pagination);
});

export const getPetById = asyncHandler(async (req, res) => {
  const pet = await petsService.getPetById(req.params.id);
  sendSuccess(res, 200, 'Pet fetched successfully', pet);
});

export const createPet = asyncHandler(async (req: AuthRequest, res) => {
  const pet = await petsService.createPet({
    ...req.body,
    ownerId: req.userId!,
  });
  sendSuccess(res, 201, 'Pet created successfully', pet);
});

export const updatePet = asyncHandler(async (req, res) => {
  const pet = await petsService.updatePet(req.params.id, req.body);
  sendSuccess(res, 200, 'Pet updated successfully', pet);
});

export const deletePet = asyncHandler(async (req, res) => {
  const pet = await petsService.deletePet(req.params.id);
  sendSuccess(res, 200, 'Pet deleted successfully', pet);
});
