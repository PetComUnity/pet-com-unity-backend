import { RequestHandler } from 'express';
import { UserModel } from '../models/user.model';
import type { UserRole } from '../types/user';
import { buildErrorResponse } from '../utils/api-response';
import { hasRole } from '../utils/access-control';
import type { AuthRequest } from './auth.middleware';

type RoleInput = UserRole | UserRole[];

function normalizeAllowedRoles(roles: RoleInput[]): UserRole[] {
  return roles.flatMap((role) => (Array.isArray(role) ? role : [role]));
}

export function requireRole(allowedRoles: UserRole[]): RequestHandler;
export function requireRole(...allowedRoles: UserRole[]): RequestHandler;
export function requireRole(...roles: RoleInput[]): RequestHandler {
  const allowedRoles = normalizeAllowedRoles(roles);

  return async (req, res, next) => {
    const authReq = req as AuthRequest;

    try {
      if (!authReq.userId) {
        res.status(401).json(buildErrorResponse('No authenticated user'));
        return;
      }

      const user = await UserModel.findById(authReq.userId)
        .select('role')
        .lean();

      if (!user) {
        res.status(401).json(buildErrorResponse('Invalid authenticated user'));
        return;
      }

      if (!hasRole(user.role, allowedRoles)) {
        res.status(403).json(buildErrorResponse('Forbidden'));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
