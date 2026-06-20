import { Router } from "express";

import {
  getStaffByClinic,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();


// Get all staff for logged-in vet clinic
router.get(
  "/me",
  authMiddleware,
  requireRole("vet"),
  getStaffByClinic
);

// Create staff under logged-in vet clinic
router.post(
  "/",
  authMiddleware,
  requireRole("vet"),
  createStaff
);

// Update staff
router.patch(
  "/:id",
  authMiddleware,
  requireRole("vet"),
  updateStaff
);

// Delete staff
router.delete(
  "/:id",
  authMiddleware,
  requireRole("vet"),
  deleteStaff
);


// Get staff by ID (for profiles, public view)
router.get("/:id", getStaffById);

export default router;