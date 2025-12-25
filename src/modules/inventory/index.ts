/**
 * Inventory Module
 * 
 * Handles all inventory and warehouse operations including:
 * - Warehouse management
 * - Inventory items and stock levels
 * - Stock documents (GRN, Issue, Adjustment, Transfer)
 * - Stock movements with idempotency
 * - Audit logging
 * 
 * @example
 * import { createInventoryService, canPostDocument, StockDocumentTypeSchema } from '@/modules/inventory';
 * 
 * // In API route with user context:
 * const service = createInventoryService({
 *   user: { userId: session.user.id, email: session.user.email, role: session.user.role },
 *   ip: request.headers.get('x-forwarded-for'),
 *   userAgent: request.headers.get('user-agent'),
 * });
 * 
 * const result = await service.postDocument(documentId);
 */

// Domain
export * from './domain';

// Repositories
export * from './repositories';

// Services
export * from './services';

