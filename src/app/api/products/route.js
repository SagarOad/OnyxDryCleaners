import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function GET(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const products = await prisma.product.findMany({
      where: { businessId: ctx.businessId },
      select: {
        id: true,
        label: true,
        price: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message },
      { status: 500 }
    );
  }
}
