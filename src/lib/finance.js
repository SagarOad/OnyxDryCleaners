/**
 * Read-only helpers for dashboard / finance views. No schema changes.
 *
 * Revenue uses stored `subtotal` only: it already equals
 * sum(line amounts) − discount + delivery (see add-order API).
 * Uses completed orders for "recognized" revenue; order volume excludes cancelled.
 */

export function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addMonths(d, delta) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function revenueFromAggregate(sum) {
  if (!sum) return 0;
  return Number(sum.subtotal ?? 0);
}

export function pctChange(current, previous) {
  if (previous === 0) {
    if (current === 0) return null;
    return 100;
  }
  return ((current - previous) / previous) * 100;
}

export async function completedRevenueAndCount(prisma, start, end, businessId) {
  const where = {
    createdAt: { gte: start, lte: end },
    status: { status: "completed" },
  };
  if (businessId) where.businessId = businessId;
  const [agg, count] = await Promise.all([
    prisma.order.aggregate({
      where,
      _sum: { subtotal: true },
    }),
    prisma.order.count({ where }),
  ]);
  return {
    revenue: revenueFromAggregate(agg._sum),
    count,
  };
}

export async function orderVolumeExcludingCancelled(prisma, start, end, businessId) {
  const where = {
    createdAt: { gte: start, lte: end },
    status: { status: { not: "cancelled" } },
  };
  if (businessId) where.businessId = businessId;
  return prisma.order.count({
    where,
  });
}
