import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  const { orderId, liveStatus } = await request.json();

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { liveStatus: { connect: { status: liveStatus } } },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order live status:", error);
    return NextResponse.json({ error: 'Failed to update order live status', details: error.message }, { status: 500 });
  }
}
