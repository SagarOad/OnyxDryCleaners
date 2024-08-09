import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const customerCount = await prisma.customer.count();
    return NextResponse.json({ count: customerCount });
  } catch (error) {
    console.error("Failed to fetch customer count:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer count", details: error.message },
      { status: 500 }
    );
  }
}
