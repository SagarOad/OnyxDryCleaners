import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function POST(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const { name, contact, address, service } = await request.json();

    // Validate that name is provided
    if (!name) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    // Create the customer, allowing optional fields to be null
    const customer = await prisma.existingCustomers.create({
      data: {
        businessId: ctx.businessId,
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
