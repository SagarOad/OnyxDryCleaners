import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;
    const orderCount = await prisma.order.count({
      where: { businessId: ctx.businessId },
    });
    return NextResponse.json({ count: orderCount });
  } catch (error) {
    console.error("Failed to fetch order count:", error);
    return NextResponse.json(
      { error: "Failed to fetch order count", details: error.message },
      { status: 500 }
    );
  }
}
