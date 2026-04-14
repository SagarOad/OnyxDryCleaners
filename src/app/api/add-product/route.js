import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function POST(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const { name, value, price, urgentPrice } = await request.json();

    if (!name || !value || isNaN(parseFloat(price)) || isNaN(parseFloat(urgentPrice))) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        businessId: ctx.businessId,
        label: name,
        value,
        price: parseFloat(price),
        urgentPrice: parseFloat(urgentPrice),
      },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error adding product:", error.message);
    return NextResponse.json({ error: "Unable to add product" }, { status: 500 });
  }
}