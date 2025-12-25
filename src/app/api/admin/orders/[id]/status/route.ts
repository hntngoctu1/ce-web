/**
 * Order Status Update API Route
 * 
 * Updates order status with validation, state machine checks,
 * automatic stock operations, and audit logging.
 */

import { NextRequest } from 'next/server';
import {
  successResponse,
  handleError,
  parseBody,
} from '@/shared';
import { getAuditContext } from '@/shared/logging';
import {
  requireAuth,
  requireAccess,
} from '@/modules/auth';
import {
  createOrderService,
  UpdateOrderStatusInputSchema,
} from '@/modules/orders';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const authResult = await requireAuth();
    if (!authResult.success) return authResult.response;

    // Permission check
    const accessCheck = requireAccess(authResult.data.user, 'orders', 'update');
    if (!accessCheck.success) return accessCheck.response;

    // Get order ID
    const { id } = await params;

    // Parse and validate body
    const body = await parseBody(req, UpdateOrderStatusInputSchema);

    // Create service with context
    const orderService = createOrderService({
      user: authResult.data.user,
      ...getAuditContext(req, authResult.data.user.userId),
    });

    // Execute status transition
    const result = await orderService.updateStatus(id, {
      newStatus: body.newStatus,
      noteInternal: body.noteInternal,
      noteCustomer: body.noteCustomer,
      cancelReason: body.cancelReason,
      force: body.force,
    });

    return successResponse({
      ok: true,
      changed: result.fromStatus !== result.toStatus,
      from: result.fromStatus,
      to: result.toStatus,
      stockAction: result.stockAction,
    });

  } catch (error) {
    return handleError(error);
  }
}
