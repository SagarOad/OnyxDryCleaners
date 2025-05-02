// /app/api/update-customer/route.js
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, email, phone } = body; // include all fields you want to update

    const updatedCustomer = await prisma.existingCustomers.update({
      where: { id },
      data: {
        name,
        email,
        phone,
      },
    });

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error("Failed to update customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer", details: error.message },
      { status: 500 }
    );
  }
}