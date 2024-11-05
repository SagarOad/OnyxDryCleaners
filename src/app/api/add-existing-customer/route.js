import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, contact, address, service } = await request.json();

    // Validate that name is provided
    if (!name) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    // Create the customer, allowing optional fields to be null
    const customer = await prisma.existingCustomers.create({
      data: {
        name,
        contact: contact || "Unknown",  // Allow null for optional fields
        address: address || "Unknown",  // Allow null for optional fields
        service: service || "Unknown",  // Allow null for optional fields
      },
    });

    // Respond with the created customer
    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error("Error adding existing customer:", error); // Log the complete error object
    return NextResponse.json({ error: "Unable to add customer", details: error.message }, { status: 500 });
  }
}
