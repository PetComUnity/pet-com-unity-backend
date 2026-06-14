import { Router } from "express";

import {
  createClinic,
  getClinics,
  getClinicById,
  updateMyClinic,
  deleteMyClinic,
  getMyClinic,
} from "../controllers/clinic.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */

// Get all clinics
router.get("/", getClinics);

// Get clinic by ID
router.get("/:id", getClinicById);

/**
 * =========================
 * VET ONLY ROUTES
 * =========================
 */

// Create clinic for logged-in vet
router.post(
  "/",
  authMiddleware,
  requireRole("vet"),
  createClinic
);

router.get("/me", authMiddleware, getMyClinic);

// Update clinic by userId (from auth token)
router.patch(
  "/",
  authMiddleware,
  requireRole("vet"),
  updateMyClinic
);

// Delete clinic by userId (from auth token)
router.delete(
  "/",
  authMiddleware,
  requireRole("vet"),
  deleteMyClinic
);

export default router;