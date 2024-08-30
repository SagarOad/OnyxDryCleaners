import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, value, price } = await request.json();

    // Validate incoming data
    if (!name || !value || isNaN(parseFloat(price))) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        label: name, // Mapping the field name to 'label'
        value,
        price: parseFloat(price),
      },
    });

    // Respond with the created product
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error adding product:", error.message);
    return NextResponse.json({ error: "Unable to add product" }, { status: 500 });
  }
}
