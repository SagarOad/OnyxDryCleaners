import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, email, phone } = await request.json();

    // Validate incoming data
    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
      },
    });

    // Respond with the created customer
    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error("Error adding customer:", error.message);
    return NextResponse.json({ error: "Unable to add customer" }, { status: 500 });
  }
}
