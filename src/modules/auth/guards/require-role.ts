/**
 * Role Guard
 * 
 * Ensures the authenticated user has the required role.
 * Use after requireAuth guard.
 */

import { NextResponse } from 'next/server';
import { AppError, handleError, type ApiErrorResponse } from '@/shared';
import type { UserRole } from '@prisma/client';
import { hasRoleLevel, isAdminRole, type UserContext } from '../domain/types';
import { hasPermission, canAccess, type Permission, type Resource, type Action } from '../domain/permissions';
import type { GuardResult } from './require-auth';

/**
 * Require a specific role or higher
 */
export function requireRole(
  userContext: UserContext,
  requiredRole: UserRole
): GuardResult<UserContext> {
  if (!hasRoleLevel(userContext.role, requiredRole)) {
    return {
      success: false,
      response: handleError(AppError.insufficientRole(requiredRole)),
    };
  }

  return {
    success: true,
    data: userContext,
  };
}

/**
 * Require admin role (ADMIN or EDITOR)
 */
export function requireAdmin(userContext: UserContext): GuardResult<UserContext> {
  if (!isAdminRole(userContext.role)) {
    return {
      success: false,
      response: handleError(AppError.forbidden('Admin access required')),
    };
  }

  return {
    success: true,
    data: userContext,
  };
}

/**
 * Require ADMIN role specifically
 */
export function requireSuperAdmin(userContext: UserContext): GuardResult<UserContext> {
  return requireRole(userContext, 'ADMIN');
}

/**
 * Require a specific permission
 */
export function requirePermission(
  userContext: UserContext,
  permission: Permission
): GuardResult<UserContext> {
  if (!hasPermission(userContext.role, permission)) {
    return {
      success: false,
      response: handleError(
        AppError.forbidden(`Missing permission: ${permission}`)
      ),
    };
  }

  return {
    success: true,
    data: userContext,
  };
}

/**
 * Require access to a resource with specific action
 */
export function requireAccess(
  userContext: UserContext,
  resource: Resource,
  action: Action
): GuardResult<UserContext> {
  if (!canAccess(userContext.role, resource, action)) {
    return {
      success: false,
      response: handleError(
        AppError.forbidden(`Cannot ${action} ${resource}`)
      ),
    };
  }

  return {
    success: true,
    data: userContext,
  };
}

/**
 * Require ownership or admin role
 * Useful for resources that users can only access if they own them
 */
export function requireOwnerOrAdmin(
  userContext: UserContext,
  ownerId: string | null | undefined
): GuardResult<UserContext> {
  // Admins can access anything
  if (isAdminRole(userContext.role)) {
    return { success: true, data: userContext };
  }

  // Check ownership
  if (ownerId && userContext.userId === ownerId) {
    return { success: true, data: userContext };
  }

  return {
    success: false,
    response: handleError(AppError.forbidden('Access denied')),
  };
}

