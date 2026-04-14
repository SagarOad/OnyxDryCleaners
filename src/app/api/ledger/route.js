import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { buildOrderListWhere } from "@/lib/orderWhere";
import {
  orderLineRevenue,
  orderNetProfitAfterOutsource,
} from "@/lib/orderMoney";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function GET(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 20;
    const statusFilter = searchParams.get("statusFilter") || "all";
    const searchQuery = searchParams.get("searchQuery") || "";

    const skip = (page - 1) * pageSize;
    const where = buildOrderListWhere(
      statusFilter,
      searchQuery,
      ctx.businessId
    );

    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true, contact: true } },
          status: true,
          items: { select: { id: true, amount: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const entries = rows.map((o) => {
      const revenue = orderLineRevenue(o);
      const netProfit = orderNetProfitAfterOutsource(o);
      return {
        id: o.id,
        createdAt: o.createdAt,
        customerName: o.customer?.name ?? "—",
        customerContact: o.customer?.contact ?? "",
        service: o.service,
        status: o.status?.status ?? "—",
        subtotal: o.subtotal,
        deliveryCharge: o.deliveryCharge,
        discount: o.discount,
        total: revenue,
        outsourcingCost: o.outsourcingCost,
        profit: o.profit,
        netProfitAfterOutsource: netProfit,
        itemCount: o.items?.length ?? 0,
      };
    });

    return NextResponse.json({
      entries,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("ledger GET error:", error);
    return NextResponse.json(
      { error: "Failed to load ledger", details: error.message },
      { status: 500 }
    );
  }
}
