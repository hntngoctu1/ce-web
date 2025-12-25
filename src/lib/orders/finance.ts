import { legacyPaymentStatusFromPaymentState } from './workflow';

// Note: We intentionally keep tx loosely typed here to avoid Prisma client type cache issues in some IDE/lint setups on Windows.
// Runtime safety is ensured by Prisma at execution time + integration tests/smoke tests.
export async function recalculateOrderFinancials(tx: any, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      total: true,
      totalAmount: true,
      orderStatus: true,
      paymentState: true,
      accountingStatus: true,
      paidAmount: true,
      outstandingAmount: true,
    },
  } as any);
  if (!order) return null;

  const payments = await tx.payment.aggregate({
    where: { orderId },
    _sum: { amount: true },
  } as any);

  const totalAmount = order.totalAmount && order.totalAmount > 0 ? order.totalAmount : order.total;
  const paidAmount = Number(payments._sum.amount ?? 0);
  const outstandingAmount = Math.max(0, totalAmount - paidAmount);

  const paymentState = paidAmount <= 0 ? 'UNPAID' : outstandingAmount <= 0 ? 'PAID' : 'PARTIAL';

  const accountingStatus =
    order.orderStatus === 'CANCELED' || order.orderStatus === 'FAILED'
      ? 'CANCELLED'
      : paymentState === 'PAID' && order.orderStatus === 'DELIVERED'
        ? 'COMPLETED'
        : paymentState === 'PAID'
          ? 'PAID'
          : paymentState === 'PARTIAL'
            ? 'PARTIALLY_PAID'
            : 'PENDING_PAYMENT';

  const legacyPaymentStatus = legacyPaymentStatusFromPaymentState(paymentState as any);

  const updated = await tx.order.update({
    where: { id: orderId },
    data: {
      totalAmount,
      paidAmount,
      outstandingAmount,
      paymentState: paymentState as any,
      paymentStatus: legacyPaymentStatus,
      accountingStatus: accountingStatus as any,
    } as any,
    select: {
      id: true,
      totalAmount: true,
      paidAmount: true,
      outstandingAmount: true,
      paymentState: true,
      accountingStatus: true,
      paymentStatus: true,
    },
  } as any);

  return updated;
}
