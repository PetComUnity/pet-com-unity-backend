import { Router } from "express";
import {
  createShelter,
  getShelterById,
  getShelters,
  getMyShelter,
  updateMyShelter,
} from "../controllers/shelters.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate-schema.middleware";
import { createShelterSchema } from "../validation/shelter.schemas";

const router = Router();

/**
 * PUBLIC
 */
router.get("/", getShelters);

/**
 * IMPORTANT:
 * MUST BE BEFORE '/:id'
 */
router.get(
  "/me",
  authMiddleware,
  getMyShelter
);

router.get("/:id", getShelterById);

/**
 * SHELTER ONLY
 */
router.post(
  "/",
  authMiddleware,
  validateSchema(createShelterSchema),
  createShelter
);

router.patch(
  "/",
  authMiddleware,
  updateMyShelter
);

export default router;