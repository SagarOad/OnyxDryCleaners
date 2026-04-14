import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

export async function GET(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("searchQuery") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const searchCondition = searchQuery
      ? {
          businessId: ctx.businessId,
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { contact: { contains: searchQuery, mode: "insensitive" } },
          ],
        }
      : { businessId: ctx.businessId };

    const existingCustomers = await prisma.existingCustomers.findMany({
      where: searchCondition,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        contact: true,
        address: true,
        service: true,
      },
    });

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
