import { createAppError } from './api-response';
import type { UserRole } from '../types/user';

export function canAccessOwnedResource(
  resourceOwnerId: string,
  userId: string,
): boolean {
  return resourceOwnerId === userId;
}

export function assertCanAccessOwnedResource(
  resourceOwnerId: string,
  userId: string,
  message = 'Forbidden',
): void {
  if (!canAccessOwnedResource(resourceOwnerId, userId)) {
    throw createAppError(message, 403);
  }
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
