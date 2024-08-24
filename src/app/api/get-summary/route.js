import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch summary data with correct relation filtering
    const [customerCount, orderCount, receivedOrdersCount, processingOrdersCount, completedOrdersCount] = await Promise.all([
      prisma.customer.count(),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: {
            status: "received" // Correctly filtering by status
          },
        },
      }),
      prisma.order.count({
        where: {
          status: {
            status: "processing" // Correctly filtering by status
          },
        },
      }),
      prisma.order.count({
        where: {
          status: {
            status: "completed" // Correctly filtering by status
          },
        },
      }),
    ]);

    return NextResponse.json({
      customerCount,
      orderCount,
      receivedOrdersCount,
      processingOrdersCount,
      completedOrdersCount,
    });
  } catch (error) {
    console.error("Failed to fetch summary data:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary data", details: error.message },
      { status: 500 }
    );
  }
}
