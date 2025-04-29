import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const searchQuery = searchParams.get("searchQuery") || "";

    const skip = (page - 1) * pageSize;

    const searchCondition = searchQuery
      ? {
          OR: [
            { label: { contains: searchQuery, mode: "insensitive" } },
            { value: { contains: searchQuery, mode: "insensitive" } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where: searchCondition,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        value: true,
        price: true,
        urgentPrice: true, // ✅ Include urgent price
        createdAt: true,
      },
    });

    const totalProducts = await prisma.product.count({
      where: searchCondition,
    });

    return NextResponse.json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / pageSize),
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message },
      { status: 500 }
    );
  }
}
