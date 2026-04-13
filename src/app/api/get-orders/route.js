import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { buildOrderListWhere } from "@/lib/orderWhere";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const statusFilter = searchParams.get("statusFilter") || "all";
    const searchQuery = (searchParams.get("searchQuery") || "").trim();

    const skip = (page - 1) * pageSize;

    const where = buildOrderListWhere(statusFilter, searchQuery);

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          items: true,
          status: true,
          liveStatus: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      totalOrders,
      totalPages: Math.max(1, Math.ceil(totalOrders / pageSize)),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}
