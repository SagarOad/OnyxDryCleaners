import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    // First delete related OrderItems
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    // Then delete the order
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 }
    );
  }
}
