import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import {
  orderLineRevenue,
  orderNetProfitAfterOutsource,
} from "@/lib/orderMoney";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

/**
 * Update editable financial / text fields on an order. No schema changes.
 */
export async function PUT(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const body = await request.json();
    const {
      id,
      subtotal,
      deliveryCharge,
      discount,
      service,
      outsourcingCost,
      profit,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const data = {};
    if (subtotal !== undefined) {
      const v = parseFloat(subtotal);
      if (Number.isNaN(v)) {
        return NextResponse.json(
          { error: "Invalid subtotal" },
          { status: 400 }
        );
      }
      data.subtotal = v;
    }
    if (deliveryCharge !== undefined) {
      const v = parseFloat(deliveryCharge);
      if (Number.isNaN(v)) {
        return NextResponse.json(
          { error: "Invalid deliveryCharge" },
          { status: 400 }
        );
      }
      data.deliveryCharge = v;
    }
    if (discount !== undefined) {
      const v = parseFloat(discount);
      if (Number.isNaN(v)) {
        return NextResponse.json({ error: "Invalid discount" }, { status: 400 });
      }
      data.discount = v;
    }
    if (service !== undefined) {
      data.service = String(service);
    }
    if (outsourcingCost !== undefined) {
      const v = parseFloat(outsourcingCost);
      if (Number.isNaN(v)) {
        return NextResponse.json(
          { error: "Invalid outsourcingCost" },
          { status: 400 }
        );
      }
      data.outsourcingCost = v;
    }
    if (profit !== undefined && profit !== null && profit !== "") {
      const v = parseFloat(profit);
      if (Number.isNaN(v)) {
        return NextResponse.json({ error: "Invalid profit" }, { status: 400 });
      }
      data.profit = v;
    } else if (profit === null || profit === "") {
      data.profit = null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedResult = await prisma.order.updateMany({
      where: { id, businessId: ctx.businessId },
      data,
    });
    if (updatedResult.count === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const updated = await prisma.order.findFirst({
      where: { id, businessId: ctx.businessId },
      include: {
        customer: { select: { name: true, contact: true } },
        status: true,
        items: { select: { id: true, amount: true } },
      },
    });

    const total = orderLineRevenue(updated);
    const netProfitAfterOutsource = orderNetProfitAfterOutsource(updated);

    return NextResponse.json({
      success: true,
      order: {
        id: updated.id,
        createdAt: updated.createdAt,
        customerName: updated.customer?.name ?? "—",
        customerContact: updated.customer?.contact ?? "",
        service: updated.service,
        status: updated.status?.status ?? "—",
        subtotal: updated.subtotal,
        deliveryCharge: updated.deliveryCharge,
        discount: updated.discount,
        total,
        outsourcingCost: updated.outsourcingCost,
        profit: updated.profit,
        netProfitAfterOutsource,
        itemCount: updated.items?.length ?? 0,
      },
    });
  } catch (error) {
    console.error("update-order-financials error:", error);
    return NextResponse.json(
      { error: "Update failed", details: error.message },
      { status: 500 }
    );
  }
}
