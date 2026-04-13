import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { buildOrderListWhere } from "@/lib/orderWhere";

/**
 * Bulk status updates or deletes. No schema changes.
 * scope: "page" requires orderIds; "filter" uses statusFilter + searchQuery.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      action,
      status,
      scope,
      orderIds,
      statusFilter = "all",
      searchQuery = "",
    } = body;

    if (!action || !["setStatus", "delete"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use setStatus or delete." },
        { status: 400 }
      );
    }

    if (!scope || !["page", "filter"].includes(scope)) {
      return NextResponse.json(
        { error: "Invalid scope. Use page or filter." },
        { status: 400 }
      );
    }

    let where = {};
    if (scope === "page") {
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json(
          { error: "orderIds required for scope=page" },
          { status: 400 }
        );
      }
      where = { id: { in: orderIds } };
    } else {
      where = buildOrderListWhere(statusFilter, searchQuery);
    }

    if (action === "setStatus") {
      if (!status) {
        return NextResponse.json(
          { error: "status required for setStatus" },
          { status: 400 }
        );
      }
      const statusRecord = await prisma.orderStatus.findUnique({
        where: { status },
      });
      if (!statusRecord) {
        return NextResponse.json(
          { error: `Status "${status}" not found` },
          { status: 400 }
        );
      }
      const result = await prisma.order.updateMany({
        where,
        data: { statusId: statusRecord.id },
      });
      return NextResponse.json({
        success: true,
        updated: result.count,
      });
    }

    if (action === "delete") {
      const ids = await prisma.order.findMany({
        where,
        select: { id: true },
      });
      const idList = ids.map((o) => o.id);
      if (idList.length === 0) {
        return NextResponse.json({ success: true, deleted: 0 });
      }
      await prisma.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({
          where: { orderId: { in: idList } },
        });
        await tx.order.deleteMany({
          where: { id: { in: idList } },
        });
      });
      return NextResponse.json({
        success: true,
        deleted: idList.length,
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("bulk-orders error:", error);
    return NextResponse.json(
      { error: "Bulk action failed", details: error.message },
      { status: 500 }
    );
  }
}
