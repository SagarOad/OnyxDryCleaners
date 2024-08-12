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
      outsourcingCompanyName,
      outsourcingCost,
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

    // Find or create the outsourcing company
    const outsourcingCompany = await prisma.outsourcingCompany.upsert({
      where: { name: outsourcingCompanyName },
      update: {
        contact: "N/A", // Assuming contact is unchanged or provided
        address: "N/A", // Assuming address is unchanged or provided
      },
      create: {
        name: outsourcingCompanyName,
        contact: "N/A", // Default contact, should be provided in request
        address: "N/A", // Default address, should be provided in request
      },
    });

    // Calculate the subtotal
    const totalItemsPrice = items.reduce((acc, item) => {
      return acc + item.quantity * item.unitPrice;
    }, 0);

    const subtotal = totalItemsPrice - charges.discount + charges.deliveryCharge;

    // Calculate the profit
    const profit = subtotal - outsourcingCost;

    // Create the order with the calculated subtotal, outsourcing details, and profit
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        service,
        statusId: statusRecord.id,
        liveStatusId: "1", // Assuming "live" has an id of 1
        deliveryCharge: charges.deliveryCharge,
        discount: charges.discount,
        subtotal: subtotal, // Add the calculated subtotal
        outsourcingCompanyId: outsourcingCompany.id, // Add the outsourcing company
        outsourcingCost: outsourcingCost, // Add the outsourcing cost
        profit: profit, // Add the calculated profit
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
        outsourcingCompany: true,
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
