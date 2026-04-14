import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function POST(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const { orderId, status } = await request.json();

    // Find the corresponding status ID
    const statusRecord = await prisma.orderStatus.findUnique({
      where: { status },
    });

    if (!statusRecord) {
      return NextResponse.json(
        { error: `Status "${status}" not found` },
        { status: 400 }
      );
    }

    // Update the order's status
    const updatedResult = await prisma.order.updateMany({
      where: { id: orderId, businessId: ctx.businessId },
      data: { statusId: statusRecord.id },
    });
    if (updatedResult.count === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const updatedOrder = await prisma.order.findFirst({
      where: { id: orderId, businessId: ctx.businessId },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status", details: error.message },
      { status: 500 }
    );
  }
}
