import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function POST(request) {
  const ctx = await getTenantContext();
  if (ctx.error) return ctx.error;
  const businessErr = requireBusiness(ctx);
  if (businessErr) return businessErr;

  const { orderId, liveStatus } = await request.json();

  try {
    const updated = await prisma.order.updateMany({
      where: { id: orderId, businessId: ctx.businessId },
      data: { liveStatus: { connect: { status: liveStatus } } },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const updatedOrder = await prisma.order.findFirst({
      where: { id: orderId, businessId: ctx.businessId },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order live status:", error);
    return NextResponse.json(
      { error: "Failed to update order live status", details: error.message },
      { status: 500 }
    );
  }
}
