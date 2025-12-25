import type { PrismaClient } from '@prisma/client';

function pad(num: number, size: number) {
  return num.toString().padStart(size, '0');
}

/**
 * Allocates an incremental order code in the format CE-YYYY-000123.
 * Must be called inside a transaction for concurrency safety.
 */
export async function allocateOrderCode(
  tx: PrismaClient,
  date: Date = new Date()
): Promise<{ orderCode: string; sequence: number; year: number }> {
  const year = date.getFullYear();

  const counter = await tx.orderCounter.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
    select: { lastNumber: true, year: true },
  });

  const sequence = counter.lastNumber;
  const orderCode = `CE-${year}-${pad(sequence, 6)}`;

  return { orderCode, sequence, year };
}
