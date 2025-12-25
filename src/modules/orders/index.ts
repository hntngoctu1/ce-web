/**
 * Orders Module
 * 
 * Handles all order-related functionality including:
 * - Order CRUD operations
 * - Status transitions with state machine
 * - Payment tracking
 * - Stock operations (reserve, deduct, release, restock)
 * - Audit logging
 * 
 * @example
 * import { createOrderService, isAllowedTransition, OrderStatusSchema } from '@/modules/orders';
 * 
 * // In API route with user context:
 * const service = createOrderService({
 *   user: { userId: session.user.id, email: session.user.email, role: session.user.role },
 *   ip: request.headers.get('x-forwarded-for'),
 *   userAgent: request.headers.get('user-agent'),
 * });
 * 
 * const result = await service.updateStatus(orderId, { newStatus: 'CONFIRMED' });
 */

// Domain
export * from './domain';

// Repositories
export * from './repositories';

// Services
export * from './services';

