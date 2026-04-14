import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getTenantContext, requireBusiness } from "@/lib/tenantAuth";

function parseDayStart(ymd) {
  const [y, m, d] = ymd.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

function parseDayEnd(ymd) {
  const [y, m, d] = ymd.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
}

function csvEscape(val) {
  const s = String(val ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsv(summary, monthly, from, to) {
  const lines = [];
  lines.push("Onyx — Ledger revenue report");
  lines.push(`Period (UTC dates),${csvEscape(from)},${csvEscape(to)}`);
  lines.push(
    `Criteria,"All orders except status = cancelled (includes received, processing, completed)"`
  );
  lines.push("");
  lines.push("How numbers are calculated");
  lines.push(
    `"Revenue per order = COALESCE(subtotal, sum(line amounts) − discount + delivery). Subtotal already includes discount and delivery from checkout — do not add delivery or subtract discount again."`
  );
  lines.push(
    `"Net profit (after outsourcing) = revenue − outsourcing cost (same as new orders: profit = subtotal − outsourcing)."`
  );
  lines.push("");
  lines.push("Summary");
  lines.push(`Order count,${summary.orderCount}`);
  lines.push(
    `Total revenue (net order totals),${Math.round(summary.totalRevenue * 100) / 100}`
  );
  lines.push(
    `Total outsourcing cost,${Math.round(summary.totalOutsourcing * 100) / 100}`
  );
  lines.push(
    `Net profit after outsourcing (revenue − outsource),${Math.round(summary.netProfitAfterOutsourcing * 100) / 100}`
  );
  lines.push(
    `Sum of stored profit field (may differ if edited),${Math.round(summary.totalProfitStored * 100) / 100}`
  );
  lines.push("");
  lines.push("Reference (components of stored rows, not added to revenue again)");
  lines.push(
    `Sum subtotal column,${Math.round(summary.sumSubtotal * 100) / 100}`
  );
  lines.push(
    `Sum delivery column,${Math.round(summary.sumDelivery * 100) / 100}`
  );
  lines.push(
    `Sum discount column,${Math.round(summary.sumDiscount * 100) / 100}`
  );
  lines.push("");
  lines.push("Monthly breakdown");
  lines.push(
    "Month,Order count,Revenue,Net profit (rev − outsource),Outsourcing,Stored profit sum"
  );
  for (const row of monthly) {
    lines.push(
      [
        csvEscape(row.label),
        row.orderCount,
        Math.round(row.revenue * 100) / 100,
        Math.round(row.netProfit * 100) / 100,
        Math.round(row.outsourcing * 100) / 100,
        Math.round(row.profitStored * 100) / 100,
      ].join(",")
    );
  }
  return "\uFEFF" + lines.join("\r\n");
}

export async function GET(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const businessErr = requireBusiness(ctx);
    if (businessErr) return businessErr;

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "json").toLowerCase();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "Query params `from` and `to` are required (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    const fromDate = parseDayStart(from);
    const toDate = parseDayEnd(to);
    if (!fromDate || !toDate || Number.isNaN(fromDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }
    if (fromDate > toDate) {
      return NextResponse.json(
        { error: "`from` must be on or before `to`." },
        { status: 400 }
      );
    }

    const [summaryRow] = await prisma.$queryRaw`
      WITH ord AS (
        SELECT
          COALESCE(
            o.subtotal,
            COALESCE(
              (SELECT SUM(i.amount) FROM "OrderItem" i WHERE i."orderId" = o.id),
              0
            ) - o.discount + o."deliveryCharge"
          ) AS revenue,
          COALESCE(o."outsourcingCost", 0) AS out_c,
          o.profit AS profit_stored,
          o.subtotal AS sub_raw,
          o."deliveryCharge" AS del_raw,
          o.discount AS disc_raw
        FROM "Order" o
        INNER JOIN "OrderStatus" s ON s.id = o."statusId"
        WHERE s.status <> 'cancelled'
          AND o."businessId" = ${ctx.businessId}
          AND o.created_at >= ${fromDate}
          AND o.created_at <= ${toDate}
      )
      SELECT
        COUNT(*)::int AS order_count,
        COALESCE(SUM(revenue), 0)::float AS revenue_sum,
        COALESCE(SUM(out_c), 0)::float AS outsourcing_sum,
        COALESCE(SUM(revenue - out_c), 0)::float AS net_profit_sum,
        COALESCE(SUM(profit_stored), 0)::float AS profit_stored_sum,
        COALESCE(SUM(sub_raw), 0)::float AS sum_subtotal,
        COALESCE(SUM(del_raw), 0)::float AS sum_delivery,
        COALESCE(SUM(disc_raw), 0)::float AS sum_discount
      FROM ord
    `;

    let monthly = [];
    try {
      const raw = await prisma.$queryRaw`
        WITH ord AS (
          SELECT
            o.created_at,
            COALESCE(
              o.subtotal,
              COALESCE(
                (SELECT SUM(i.amount) FROM "OrderItem" i WHERE i."orderId" = o.id),
                0
              ) - o.discount + o."deliveryCharge"
            ) AS revenue,
            COALESCE(o."outsourcingCost", 0) AS out_c,
            o.profit AS profit_stored
          FROM "Order" o
          INNER JOIN "OrderStatus" s ON s.id = o."statusId"
          WHERE s.status <> 'cancelled'
            AND o."businessId" = ${ctx.businessId}
            AND o.created_at >= ${fromDate}
            AND o.created_at <= ${toDate}
        )
        SELECT
          date_trunc('month', created_at) AS month_bucket,
          COUNT(*)::int AS order_count,
          COALESCE(SUM(revenue), 0)::float AS revenue,
          COALESCE(SUM(revenue - out_c), 0)::float AS net_profit,
          COALESCE(SUM(out_c), 0)::float AS outsourcing_sum,
          COALESCE(SUM(profit_stored), 0)::float AS profit_stored_sum
        FROM ord
        GROUP BY 1
        ORDER BY 1 ASC
      `;

      monthly = raw.map((r) => {
        const bucket = r.month_bucket;
        const d = bucket instanceof Date ? bucket : new Date(bucket);
        const label = d.toLocaleString("en-GB", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        });
        return {
          monthKey: d.toISOString().slice(0, 7),
          label,
          orderCount: Number(r.order_count),
          revenue: Number(r.revenue),
          netProfit: Number(r.net_profit),
          outsourcing: Number(r.outsourcing_sum),
          profitStored: Number(r.profit_stored_sum),
        };
      });
    } catch (e) {
      console.error("ledger-report monthly query:", e);
    }

    const orderCount = Number(summaryRow?.order_count ?? 0);
    const totalRevenue = Number(summaryRow?.revenue_sum ?? 0);
    const totalOutsourcing = Number(summaryRow?.outsourcing_sum ?? 0);
    const netProfitAfterOutsourcing = Number(summaryRow?.net_profit_sum ?? 0);
    const totalProfitStored = Number(summaryRow?.profit_stored_sum ?? 0);
    const sumSubtotal = Number(summaryRow?.sum_subtotal ?? 0);
    const sumDelivery = Number(summaryRow?.sum_delivery ?? 0);
    const sumDiscount = Number(summaryRow?.sum_discount ?? 0);

    const summary = {
      orderCount,
      totalRevenue,
      totalOutsourcing,
      netProfitAfterOutsourcing,
      totalProfitStored,
      sumSubtotal,
      sumDelivery,
      sumDiscount,
      criteria:
        "Revenue = net order total (stored subtotal, or rebuilt from line items + discount + delivery). Delivery/discount columns are informational only when subtotal is set. Net profit = revenue − outsourcing (matches new order logic).",
    };

    if (format === "csv") {
      const csv = buildCsv(summary, monthly, from, to);
      const safeName = `ledger-report-${from}-to-${to}.csv`;
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeName}"`,
        },
      });
    }

    return NextResponse.json({
      from,
      to,
      summary,
      monthly,
    });
  } catch (error) {
    console.error("ledger-report error:", error);
    return NextResponse.json(
      { error: "Failed to build report", details: error.message },
      { status: 500 }
    );
  }
}
