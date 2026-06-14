import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Clinic } from "../models/clinic.model";
import { UserModel } from "../models/user.model";
import { Shelter } from "../models/shelter.model";

/**
 * =========================
 * REGISTER
 * =========================
 */
export const register = asyncHandler(async (req, res) => {
  const authResult = await authService.register(req.body);

  sendSuccess(res, 201, "User registered successfully", authResult);
});

/**
 * =========================
 * LOGIN
 * =========================
 */
export const login = asyncHandler(async (req, res) => {
  const authResult = await authService.login(req.body);

  sendSuccess(res, 200, "User logged in successfully", authResult);
});

/**
 * =========================
 * GET CURRENT USER (CLEAN)
 * =========================
 */
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res) => {
  const { user, organization } = await authService.getCurrentUser(req.userId!);

  sendSuccess(res, 200, "Current user fetched successfully", {
    user,
    organization,
  });
});

/**
 * =========================
 * UPDATE CURRENT USER (CLEAN)
 * =========================
 */
export const updateCurrentUser = asyncHandler(
  async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const payload = req.body;

    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");

    /**
     * =========================
     * UPDATE USER (ALWAYS)
     * =========================
     */
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.email !== undefined && { email: payload.email }),
        ...(payload.phone !== undefined && { phone: payload.phone }),
        ...(payload.city !== undefined && { city: payload.city }),
        ...(payload.address !== undefined && { address: payload.address }),
        ...(payload.website !== undefined && { website: payload.website }),
        ...(payload.socialMediaLink !== undefined && {
          socialMediaLink: payload.socialMediaLink,
        }),
      },
      { new: true, runValidators: true }
    ).lean();

    /**
     * =========================
     * UPDATE CLINIC (ONLY VET)
     * =========================
     */
    let clinic = null;

    if (user.role === "vet") {
      clinic = await Clinic.findOneAndUpdate(
        { userId },
        {
          ...(payload.name !== undefined && { name: payload.name }),
          ...(payload.email !== undefined && { email: payload.email }),
          ...(payload.website !== undefined && { website: payload.website }),
          ...(payload.registrationNumber !== undefined && {
            registrationNumber: payload.registrationNumber,
          }),
          ...(payload.phone !== undefined && {
            phoneNumbers: [payload.phone],
          }),
          ...(payload.city !== undefined || payload.address !== undefined
            ? {
                location: payload.address ?? payload.city,
              }
            : {}),
          ...(payload.operatingHours !== undefined && {
            workingHours: payload.operatingHours,
          }),
          ...(payload.socialLinks !== undefined && {
            socialMediaLinks: payload.socialLinks,
          }),
        },
        { new: true, runValidators: true }
      ).lean();
    }

    sendSuccess(res, 200, "User updated successfully", {
      user: updatedUser,
      clinic,
    });
  }
);

/**
 * =========================
 * CHANGE PASSWORD
 * =========================
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res) => {
  await authService.changePassword(req.userId!, req.body);

  sendSuccess(res, 200, "Password changed successfully");
});

/**
 * =========================
 * LOGOUT
 * =========================
 */
export const logout = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, "Logged out successfully");
});