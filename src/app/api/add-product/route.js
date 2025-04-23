import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, value, price, urgentPrice } = await request.json();

    if (!name || !value || isNaN(parseFloat(price)) || isNaN(parseFloat(urgentPrice))) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
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