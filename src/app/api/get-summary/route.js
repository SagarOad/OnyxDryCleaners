import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  completedRevenueAndCount,
  orderVolumeExcludingCancelled,
  pctChange,
} from "@/lib/finance";

export async function GET() {
  try {
    const now = new Date();

    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthRef = addMonths(now, -1);
    const lastMonthStart = startOfMonth(lastMonthRef);
    const lastMonthEnd = endOfMonth(lastMonthRef);

    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [
      customerCount,
      orderCount,
      receivedOrdersCount,
      processingOrdersCount,
      completedOrdersCount,
      cancelledOrdersCount,
      thisMonthVolume,
      lastMonthVolume,
      thisMonthFin,
      lastMonthFin,
      ytdFin,
      rollingYearFin,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.order.count(),
      prisma.order.count({
        where: { status: { status: "received" } },
      }),
      prisma.order.count({
        where: { status: { status: "processing" } },
      }),
      prisma.order.count({
        where: { status: { status: "completed" } },
      }),
      prisma.order.count({
        where: { status: { status: "cancelled" } },
      }),
      orderVolumeExcludingCancelled(prisma, thisMonthStart, thisMonthEnd),
      orderVolumeExcludingCancelled(prisma, lastMonthStart, lastMonthEnd),
      completedRevenueAndCount(prisma, thisMonthStart, thisMonthEnd),
      completedRevenueAndCount(prisma, lastMonthStart, lastMonthEnd),
      completedRevenueAndCount(prisma, yearStart, now),
      completedRevenueAndCount(prisma, twelveMonthsAgo, now),
    ]);

    const orderGrowthPercent = pctChange(thisMonthVolume, lastMonthVolume);
    const revenueGrowthPercent = pctChange(
      thisMonthFin.revenue,
      lastMonthFin.revenue
    );

    const avgOrderValueThisMonth =
      thisMonthFin.count > 0
        ? thisMonthFin.revenue / thisMonthFin.count
        : 0;

    const monthOffsets = [5, 4, 3, 2, 1, 0];
    const monthlyTrend = await Promise.all(
      monthOffsets.map(async (i) => {
        const ref = addMonths(now, -i);
        const ms = startOfMonth(ref);
        const me = endOfMonth(ref);
        const { revenue, count } = await completedRevenueAndCount(
          prisma,
          ms,
          me
        );
        return {
          label: ref.toLocaleString("en-GB", {
            month: "short",
            year: "numeric",
          }),
          monthKey: `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`,
          revenue,
          completedOrders: count,
        };
      })
    );

    return NextResponse.json({
      customerCount,
      orderCount,
      receivedOrdersCount,
      processingOrdersCount,
      completedOrdersCount,
      cancelledOrdersCount,
      finance: {
        revenueThisMonth: thisMonthFin.revenue,
        revenueLastMonth: lastMonthFin.revenue,
        revenueYtd: ytdFin.revenue,
        revenueRolling12Months: rollingYearFin.revenue,
        completedOrdersRolling12Months: rollingYearFin.count,
        completedOrdersThisMonth: thisMonthFin.count,
        completedOrdersLastMonth: lastMonthFin.count,
        ordersThisMonth: thisMonthVolume,
        ordersLastMonth: lastMonthVolume,
        orderGrowthPercent,
        revenueGrowthPercent,
        avgOrderValueThisMonth,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("Failed to fetch summary data:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary data", details: error.message },
      { status: 500 }
    );
  }
}
