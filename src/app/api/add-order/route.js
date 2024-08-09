import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerContact,
      customerAddress,
      service,
      items,
      charges,
      status,
    } = body;

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
      where: { name: customerName },
      update: {
        contact: customerContact,
        address: customerAddress,
        service,
      },
      create: {
        name: customerName,
        contact: customerContact,
        address: customerAddress,
        service,
      },
    });

    // Create the order with default liveStatusId set to 1
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        service,
        statusId: statusRecord.id,
        liveStatusId: "1",  // Assuming "live" has an id of 1
        deliveryCharge: charges.deliveryCharge,
        discount: charges.discount,
        items: {
          create: items.map((item) => ({
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
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
