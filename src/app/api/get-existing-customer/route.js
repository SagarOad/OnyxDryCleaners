import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Extract search query from URL, if provided
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("searchQuery") || "";

    // Define a condition to search by existing customer name or contact
    const searchCondition = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { contact: { contains: searchQuery, mode: "insensitive" } },
          ],
        }
      : {};

    // Fetch all existing customers, applying the search condition (without pagination)
    const existingCustomers = await prisma.existingCustomers.findMany({
      where: searchCondition,
      select: {
        id: true,
        name: true,
        contact: true,
        address: true,
        service: true,
      },
    });

    // Count total existing customers (for informational purposes)
    const totalExistingCustomers = await prisma.existingCustomers.count({
      where: searchCondition,
    });

    return NextResponse.json({
      existingCustomers,
      totalExistingCustomers,
    });
  } catch (error) {
    console.error("Failed to fetch existing customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch existing customers", details: error.message },
      { status: 500 }
    );
  }
}
