import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { orderId, status } = await request.json();

    // Find the corresponding status ID
    const statusRecord = await prisma.orderStatus.findUnique({
      where: { status },
    });

    if (!statusRecord) {
      return NextResponse.json(
        { error: `Status "${status}" not found` },
        { status: 400 }
      );
    }

    // Update the order's status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { statusId: statusRecord.id },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status", details: error.message },
      { status: 500 }
    );
  }
}
