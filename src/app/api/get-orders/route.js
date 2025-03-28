import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;

    // Calculate the offset for pagination
    const skip = (page - 1) * pageSize;

    // Fetch orders with pagination, including related data
    const orders = await prisma.order.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" }, // Ensures the latest orders appear first
      include: {
        customer: true,
        items: true,
        status: true,
        liveStatus: true,
      },
    });

    // Fetch total count of orders for pagination
    const totalOrders = await prisma.order.count();

    return NextResponse.json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / pageSize),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}
