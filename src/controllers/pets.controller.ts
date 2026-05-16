import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
import { petsService } from '../services/pets.service';

export const getPets = asyncHandler(async (_req, res) => {
  const pets = await petsService.getAllPets();

  sendSuccess(res, 200, 'Pets fetched successfully', pets);
});

export const getPetById = asyncHandler(async (req, res) => {
  const pet = await petsService.getPetById(req.params.id);

  sendSuccess(res, 200, 'Pet fetched successfully', pet);
});

export const createPet = asyncHandler(async (req, res) => {
  const pet = await petsService.createPet(req.body);

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
