import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function POST(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const body = await request.json();
    const {
      customerName,
      customerContact,
      customerAddress,
      service,
      items,
      charges,
      status,
      outsourcingCompanyName,
      outsourcingCost,
      existingCustomerId,
    } = body;

    // Check if existingCustomerId is provided
    if (existingCustomerId === undefined) {
      return NextResponse.json(
        { error: "existingCustomerId must be provided" },
        { status: 400 }
      );
    }

    // Check if the service is provided
    if (!service) {
      return NextResponse.json(
        { error: "Service must not be null" },
        { status: 400 }
      );
    }

    // Check if the status exists
    const statusRecord = await prisma.orderStatus.findUnique({
      where: { status },
    });

    if (!statusRecord) {
      return NextResponse.json(
        { error: `Status "${status}" not found` },
        { status: 400 }
      );
    }

    // Find or create the customer
    const customer = await prisma.customer.upsert({
      where: { businessId_name: { businessId: ctx.businessId, name: customerName } },
      update: {
        contact: customerContact,
        address: customerAddress,
        service,
        existingId: existingCustomerId, // Use existingCustomerId
      },
      create: {
        businessId: ctx.businessId,
        name: customerName,
        contact: customerContact,
        address: customerAddress,
        service,
        existingId: existingCustomerId, // Use existingCustomerId
      },
    });

    // Find or create the outsourcing company
    const outsourcingCompany = await prisma.outsourcingCompany.upsert({
      where: {
        businessId_name: { businessId: ctx.businessId, name: outsourcingCompanyName },
      },
      update: {
        contact: "N/A",
        address: "N/A",
      },
      create: {
        businessId: ctx.businessId,
        name: outsourcingCompanyName,
        contact: "N/A",
        address: "N/A",
      },
    });

    // Calculate the subtotal
    const totalItemsPrice = items.reduce((acc, item) => {
      return acc + item.quantity * item.unitPrice;
    }, 0);

    const subtotal =
      totalItemsPrice - charges.discount + charges.deliveryCharge;

    // Calculate the profit
    const profit = subtotal - outsourcingCost;

    // Create the order with the calculated subtotal, outsourcing details, and profit
    const order = await prisma.order.create({
      data: {
        businessId: ctx.businessId,
        customerId: customer.id,
        service,
        statusId: statusRecord.id,
        liveStatusId: "1", // Use a valid string ID here
        deliveryCharge: charges.deliveryCharge,
        discount: charges.discount,
        subtotal: subtotal,
        outsourcingCompanyId: outsourcingCompany.id,
        outsourcingCost: outsourcingCost,
        profit: profit,
        items: {
          create: items.map((item) => ({
            businessId: ctx.businessId,
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
        status: true,
        liveStatus: true,
        outsourcingCompany: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error); // Log the full error object

    // Check OrderStatus and OrderLiveStatus when an error occurs
    try {
      const allOrderStatuses = await prisma.orderStatus.findMany();
      const allLiveStatuses = await prisma.orderLiveStatus.findMany();
      console.log("Order Statuses:", allOrderStatuses);
      console.log("Live Statuses:", allLiveStatuses);
    } catch (dbError) {
      console.error("Error fetching statuses:", dbError);
    }

    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
