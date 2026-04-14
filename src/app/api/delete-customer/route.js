import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function DELETE(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const body = await request.json();
    const { id } = body;

    const deleted = await prisma.existingCustomers.deleteMany({
      where: { id, businessId: ctx.businessId },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete Customer:", error);
    return NextResponse.json(
      { error: "Failed to delete Customer", details: error.message },
      { status: 500 }
    );
  }
}