/**
 * Auth Module
 * 
 * Centralized authentication and authorization.
 * 
 * @example
 * // In an API route:
 * import { requireAuth, requireAdmin, requireAccess } from '@/modules/auth';
 * 
 * export async function GET(request: NextRequest) {
 *   const authResult = await requireAuth();
 *   if (!authResult.success) return authResult.response;
 *   
 *   const adminCheck = requireAdmin(authResult.data.user);
 *   if (!adminCheck.success) return adminCheck.response;
 *   
 *   // ... handle request
 * }
 */

// Domain types and permissions
export * from './domain';

// Guards
export * from './guards';

