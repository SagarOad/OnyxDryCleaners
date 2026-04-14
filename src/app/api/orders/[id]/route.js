// app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    await prisma.orderItem.deleteMany({
      where: { orderId: id, businessId: ctx.businessId },
    });
    const deleted = await prisma.order.deleteMany({
      where: { id, businessId: ctx.businessId },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 }
    );
  }
}
