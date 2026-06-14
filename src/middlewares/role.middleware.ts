import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";
import { buildErrorResponse } from "../utils/api-response";

export const requireRole =
  (...roles: string[]) =>
  (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.role) {
      res.status(401).json(
        buildErrorResponse("Unauthorized"),
      );

      return;
    }

    if (!roles.includes(req.role)) {
      res.status(403).json(
        buildErrorResponse("Forbidden"),
      );

      return;
    }

    next();
  };