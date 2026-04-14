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

    // Validate incoming data
    if (!name || !contact) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        businessId: ctx.businessId,
        name,
        contact,
        address: address || "",
        service: service || "",
      },
    });

    // Respond with the created customer
    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error("Error adding customer:", error.message);
    return NextResponse.json({ error: "Unable to add customer" }, { status: 500 });
  }
}
