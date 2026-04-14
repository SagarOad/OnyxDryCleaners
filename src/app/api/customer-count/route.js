import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;
    const customerCount = await prisma.customer.count({
      where: { businessId: ctx.businessId },
    });
    return NextResponse.json({ count: customerCount });
  } catch (error) {
    console.error("Failed to fetch customer count:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer count", details: error.message },
      { status: 500 }
    );
  }
}
