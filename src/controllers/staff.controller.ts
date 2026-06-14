import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, createAppError } from "../utils/api-response";
import { staffService } from "../services/staff.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const safeJSONParse = (value: any, fallback: any) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const getStaffByClinic = asyncHandler(
  async (req: AuthRequest, res) => {
    const staff = await staffService.getStaffByUserId(req.userId!);

    sendSuccess(res, 200, "Staff fetched successfully", staff);
  }
);

export const getStaffById = asyncHandler(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id);

  if (!staff) {
    throw createAppError("Staff not found", 404);
  }

  sendSuccess(res, 200, "Staff fetched successfully", staff);
});

export const createStaff = asyncHandler(async (req: AuthRequest, res) => {
  const staff = await staffService.createStaff({
    ...req.body,

    userId: req.userId,

    position: req.body.position,

    workingDays: safeJSONParse(req.body.workingDays, []),

    workingHours: safeJSONParse(req.body.workingHours, {
      start: null,
      end: null,
    }),

    documents: {
      governmentIdScan: req.body.governmentIdScan || null,
      degreeCertificate: req.body.degreeCertificate || null,
      licenceScan: req.body.licenceScan || null,
    },
  });

  sendSuccess(res, 201, "Staff created successfully", staff);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.updateStaff(req.params.id, {
    ...req.body,

    position: req.body.position,

    workingDays: safeJSONParse(req.body.workingDays, []),

    workingHours: safeJSONParse(req.body.workingHours, {
      start: null,
      end: null,
    }),

    documents: {
      governmentIdScan: req.body.governmentIdScan || null,
      degreeCertificate: req.body.degreeCertificate || null,
      licenceScan: req.body.licenceScan || null,
    },
  });

  if (!staff) {
    throw createAppError("Staff not found", 404);
  }

  sendSuccess(res, 200, "Staff updated successfully", staff);
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.deleteStaff(req.params.id);

  if (!staff) {
    throw createAppError("Staff not found", 404);
  }

  sendSuccess(res, 200, "Staff deleted successfully", staff);
});