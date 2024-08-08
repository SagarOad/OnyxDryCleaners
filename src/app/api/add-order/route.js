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

    // Find customer by name
    let customer = await prisma.customer.findFirst({
      where: { name: customerName },
    });

    if (!customer) {
      // Create customer if not found
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          contact: customerContact,
          address: customerAddress,
          service,
        },
      });
    } else {
      // Update customer details if found
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          contact: customerContact,
          address: customerAddress,
          service,
        },
      });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        service,
        statusId: statusRecord.id,
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
