// /app/api/update-product-price/route.js
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function PUT(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const body = await request.json();
    const { id, label, price, urgentPrice } = body;

    const updatedResult = await prisma.product.updateMany({
      where: { id, businessId: ctx.businessId },
      data: {
        label,
        price,
        urgentPrice,
      },
    });
    if (updatedResult.count === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const updatedProduct = await prisma.product.findFirst({
      where: { id, businessId: ctx.businessId },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}
