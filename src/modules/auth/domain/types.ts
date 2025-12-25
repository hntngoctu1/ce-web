/**
 * Auth Domain Types
 */

import type { UserRole } from '@prisma/client';

export type { UserRole } from '@prisma/client';

/**
 * User session data
 */
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  image?: string | null;
}

/**
 * Auth session
 */
export interface AuthSession {
  user: SessionUser;
  expires: string;
}

/**
 * User context for API operations
 */
export interface UserContext {
  userId: string;
  email: string;
  role: UserRole;
  name?: string | null;
}

/**
 * Admin roles that can access admin panel
 */
export const ADMIN_ROLES: UserRole[] = ['ADMIN', 'EDITOR'];

/**
 * Check if role is admin level
 */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Role hierarchy (higher index = more privileges)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CUSTOMER: 0,
  EDITOR: 1,
  ADMIN: 2,
};

/**
 * Check if role A has at least the privileges of role B
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

