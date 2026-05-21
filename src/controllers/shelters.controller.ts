import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
import { sheltersService } from '../services/shelters.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getShelters = asyncHandler(async (_req, res) => {
  const shelters = await sheltersService.getAllShelters();
  sendSuccess(res, 200, 'Shelters fetched successfully', shelters);
});

export const getShelterById = asyncHandler(async (req, res) => {
  const shelter = await sheltersService.getShelterById(req.params.id);
  sendSuccess(res, 200, 'Shelter fetched successfully', shelter);
});

export const createShelter = asyncHandler(async (req: AuthRequest, res) => {
  const shelter = await sheltersService.createShelter({
    ...req.body,
    ownerId: req.userId!,
  });
  sendSuccess(res, 201, 'Shelter created successfully', shelter);
});
