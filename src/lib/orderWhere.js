/**
 * Shared Prisma `where` for order lists (orders page, bulk actions, counts).
 */
export function buildOrderListWhere(statusFilter, searchQuery, businessId) {
  const where = {};
  if (businessId) {
    where.businessId = businessId;
  }

  if (statusFilter && statusFilter !== "all") {
    where.status = { status: statusFilter };
  }

  const q = (searchQuery || "").trim();
  if (q) {
    where.OR = [
      {
        customer: {
          name: { contains: q, mode: "insensitive" },
        },
      },
      {
        service: { contains: q, mode: "insensitive" },
      },
      {
        customer: {
          contact: { contains: q, mode: "insensitive" },
        },
      },
    ];
  }

  return where;
}
