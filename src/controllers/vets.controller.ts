import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
import { vetsService } from '../services/vets.service';

export const getVets = asyncHandler(async (_req, res) => {
  const vets = await vetsService.getAllVets();

  sendSuccess(res, 200, 'Vets fetched successfully', vets);
});

export const getVetById = asyncHandler(async (req, res) => {
  const vet = await vetsService.getVetById(req.params.id);

  sendSuccess(res, 200, 'Vet fetched successfully', vet);
});

export const createVet = asyncHandler(async (req, res) => {
  const vet = await vetsService.createVet(req.body);

  sendSuccess(res, 201, 'Vet created successfully', vet);
});
