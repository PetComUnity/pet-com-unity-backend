import { asyncHandler } from "../utils/async-handler";
import { createAppError, sendSuccess } from "../utils/api-response";
import { clinicsService } from "../services/clinic.service";
import { Request } from "express";

export const createClinic = asyncHandler(async (req: Request, res) => {
  const clinic = await clinicsService.createClinic(req.body);

  sendSuccess(res, 201, "Clinic created successfully", clinic);
});

export const getClinicById = asyncHandler(async (req: Request, res) => {
  const clinic = await clinicsService.getClinicById(req.params.id);

  sendSuccess(res, 200, "Clinic fetched successfully", clinic);
});

export const getMyClinic = asyncHandler(async (req: Request, res) => {
  const clinic = await clinicsService.getMyClinic(req.params.id);

  sendSuccess(res, 200, "Clinic fetched successfully", clinic);
});

export const updateMyClinic = asyncHandler(async (req: any, res) => {
  // Use 'req.userId' because that is how your middleware sets it
  const userId = req.userId; 

  if (!userId) {
    res.status(401).json({ success: false, message: "User not authenticated" });
    return;
  }

  // Pass 'userId' to the service
  const clinic = await clinicsService.updateMyClinic(userId, req.body);
  
  if (!clinic) {
    res.status(404).json({ success: false, message: "Clinic not found" });
    return;
  }

  sendSuccess(res, 200, "Clinic updated successfully", clinic);
});

export const deleteMyClinic = asyncHandler(async (req: Request, res) => {
  const clinic = await clinicsService.deleteMyClinic(req.params.id);

  sendSuccess(res, 200, "Clinic deleted successfully", clinic);
});

export const getClinics = asyncHandler(async (req, res) => {
  const clinics = await clinicsService.getClinics();

  sendSuccess(res, 200, "Clinics fetched successfully", clinics);
});