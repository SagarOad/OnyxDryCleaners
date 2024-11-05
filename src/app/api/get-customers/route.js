import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Extract query parameters for pagination and search
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const searchQuery = searchParams.get("searchQuery") || "";

    // Calculate the offset for pagination
    const skip = (page - 1) * pageSize;

    // Define a condition to search by customer name or contact
    const searchCondition = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { contact: { contains: searchQuery, mode: "insensitive" } },
          ],
        }
      : {};

    // Fetch customers with their related orders and statuses, applying the search condition
    const customers = await prisma.customer.findMany({
      where: searchCondition,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        contact: true,
        service: true,
        orders: {
          select: {
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Count total customers for pagination, considering the search query
    const totalCustomers = await prisma.customer.count({
      where: searchCondition,
    });

    return NextResponse.json({
      customers,
      totalCustomers,
      totalPages: Math.ceil(totalCustomers / pageSize),
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers", details: error.message },
      { status: 500 }
    );
  }
}
