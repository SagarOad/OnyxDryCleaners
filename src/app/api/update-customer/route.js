// /app/api/update-customer/route.js
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function PUT(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const body = await request.json();
    const { id, name, contact, address, service } = body; // Destructure all needed fields

    const updated = await prisma.existingCustomers.updateMany({
      where: { id, businessId: ctx.businessId },
      data: {
        name,
        contact, // changed from `phone` to `contact` to match your schema
        address,
        service,
      },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const updatedCustomer = await prisma.existingCustomers.findFirst({
      where: { id, businessId: ctx.businessId },
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
