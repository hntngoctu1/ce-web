/**
 * Authentication Guard
 * 
 * Ensures the request has a valid authenticated session.
 * Use this as the first guard in API routes that require authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AppError, handleError, type ApiErrorResponse } from '@/shared';
import type { UserContext, SessionUser } from '../domain/types';

/**
 * Result of authentication check
 */
export interface AuthResult {
  user: UserContext;
  session: {
    user: SessionUser;
    expires: string;
  };
}

/**
 * Guard function type
 */
export type GuardResult<T> = 
  | { success: true; data: T }
  | { success: false; response: NextResponse<ApiErrorResponse> };

/**
 * Require authentication
 * Returns user context if authenticated, error response if not
 */
export async function requireAuth(request?: NextRequest): Promise<GuardResult<AuthResult>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        response: handleError(AppError.authRequired()),
      };
    }

    const userContext: UserContext = {
      userId: session.user.id,
      email: session.user.email ?? '',
      role: session.user.role ?? 'CUSTOMER',
      name: session.user.name,
    };

    return {
      success: true,
      data: {
        user: userContext,
        session: session as AuthResult['session'],
      },
    };
  } catch (error) {
    return {
      success: false,
      response: handleError(error),
    };
  }
}

/**
 * Extract user context from session (synchronous version for use after requireAuth)
 */
export function getUserContext(session: { user: SessionUser }): UserContext {
  return {
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    name: session.user.name,
  };
}

