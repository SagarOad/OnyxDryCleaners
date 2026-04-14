import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getTenantContext, requireSuperAdmin } from "@/lib/tenantAuth";

export async function PATCH(request, { params }) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const forbidden = requireSuperAdmin(ctx);
    if (forbidden) return forbidden;

    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Subscription id is required" }, { status: 400 });
    }

    const body = await request.json();
    const data = {};

    if (body.monthlyAmount !== undefined) {
      const amount = Number(body.monthlyAmount);
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ error: "Invalid monthlyAmount" }, { status: 400 });
      }
      data.monthlyAmount = amount;
    }
    if (body.paymentStatus !== undefined) {
      data.paymentStatus = String(body.paymentStatus);
    }
    if (body.nextDueDate !== undefined) {
      data.nextDueDate = body.nextDueDate ? new Date(body.nextDueDate) : null;
    }
    if (body.notes !== undefined) {
      data.notes = body.notes ? String(body.notes) : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    console.error("superadmin subscription PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription", details: error.message },
      { status: 500 }
    );
  }
}

