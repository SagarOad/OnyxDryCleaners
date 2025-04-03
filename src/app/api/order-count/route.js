import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orderCount = await prisma.order.count();
    return NextResponse.json({ count: orderCount });
  } catch (error) {
    console.error("Failed to fetch order count:", error);
    return NextResponse.json(
      { error: "Failed to fetch order count", details: error.message },
      { status: 500 }
    );
  }
}
