// /app/api/update-product-price/route.js
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, label, price, urgentPrice } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        label,
        price,
        urgentPrice,
      },
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
