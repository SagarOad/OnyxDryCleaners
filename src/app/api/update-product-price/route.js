// /app/api/update-product/route.js (or similar)
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, price, urgentPrice } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        price,
        urgentPrice, // ✅ Make sure this is included
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