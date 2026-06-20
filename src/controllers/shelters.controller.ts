import { Request, Response } from 'express';
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import { sheltersService } from '../services/shelters.service';

export const createShelter = asyncHandler(async (req: any, res: Response) => {
  // Assuming the request body already contains the user ID or we attach it
  const data = { ...req.body, userId: req.userId };
  const shelter = await sheltersService.createShelter(data);

  sendSuccess(res, 201, "Shelter created successfully", shelter);
});
/**
 * Update the shelter profile for the logged-in user
 */
export const updateMyShelter = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "User not authenticated" });
    return; // This returns undefined, which satisfies Promise<void>
  }

  const shelter = await sheltersService.updateMyShelter(userId, req.body);
  
  if (!shelter) {
    res.status(404).json({ success: false, message: "Shelter profile not found" });
    return; // This returns undefined, which satisfies Promise<void>
  }

  
  sendSuccess(res, 200, "Shelter updated successfully", shelter);
});
 
/**
 * Get the shelter profile for the logged-in user
 */
export const getMyShelter = asyncHandler(async (req: any, res: Response) => {
  const userId = req.userId;
  const shelter = await sheltersService.getMyShelter(userId);
  
  if (!shelter) {
    res.status(404).json({ success: false, message: "Shelter not found" });
  }

  sendSuccess(res, 200, "Shelter fetched successfully", shelter);
});

export const getShelters = asyncHandler(async (req: Request, res: Response) => {
  const shelters = await sheltersService.getShelters();
  sendSuccess(res, 200, "Shelters fetched successfully", shelters);
});

export const getShelterById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const shelter = await sheltersService.getShelterById(id);

  if (!shelter) {
    res.status(404).json({ success: false, message: "Shelter not found" });
    return;
  }

  sendSuccess(res, 200, "Shelter fetched successfully", shelter);
});