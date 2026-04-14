import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    // Fetch products from the database
    const products = await prisma.product.findMany({
      where: { businessId: ctx.businessId },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return NextResponse.json({ error: "Unable to fetch products" }, { status: 500 });
  }
}
