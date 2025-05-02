// /app/api/update-customer/route.js
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, contact, address, service } = body; // ✅ Destructure all needed fields

    const updatedCustomer = await prisma.existingCustomers.update({
      where: { id },
      data: {
        name,
        contact, // changed from `phone` to `contact` to match your schema
        address,
        service,
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
