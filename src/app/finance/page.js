"use client";

import AdminShell from "@/components/AdminShell";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
const ALLOWED_ROLES = new Set(["admin", "business_admin", "superadmin"]);

const defaultFinance = {
  revenueThisMonth: 0,
  revenueLastMonth: 0,
  revenueYtd: 0,
  revenueRolling12Months: 0,
  completedOrdersThisMonth: 0,
  completedOrdersLastMonth: 0,
  completedOrdersRolling12Months: 0,
  ordersThisMonth: 0,
  ordersLastMonth: 0,
  orderGrowthPercent: null,
  revenueGrowthPercent: null,
  avgOrderValueThisMonth: 0,
  monthlyTrend: [],
};

function formatRs(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `Rs ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(Math.round(n))}`;
}

function formatPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export default function FinancePage() {
  const [finance, setFinance] = useState(defaultFinance);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && !ALLOWED_ROLES.has(session.user.role))
    ) {
      router.push("/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/get-summary");
        if (!res.ok) throw new Error("Failed to load finance data");
        const data = await res.json();
        setFinance({ ...defaultFinance, ...data.finance });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (status === "loading") {
    return (
      <AdminShell title="Finance">
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      </AdminShell>
    );
  }

  if (!session || !ALLOWED_ROLES.has(session.user.role)) {
    return null;
  }

  return (
    <AdminShell title="Finance">
      <div className="mb-6 flex gap-3 rounded-lg border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950">
        <Info className="h-5 w-5 shrink-0 text-sky-600" />
        <div>
          <p className="font-medium">How these numbers are calculated</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sky-900/90">
            <li>
              <strong>Revenue</strong> uses <em>completed</em> orders only:
              subtotal + delivery charge − discount (same fields as on each
              order).
            </li>
            <li>
              <strong>Order volume</strong> counts non-cancelled orders in the
              calendar month (server timezone; set <code className="rounded bg-white/80 px-1">TZ</code> on
              Vercel if you need a specific region).
            </li>
            <li>
              Historical rows with missing subtotals may slightly under-report
              revenue until those fields are present.
            </li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                This month · revenue
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatRs(finance.revenueThisMonth)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {finance.completedOrdersThisMonth} completed · MoM{" "}
                {formatPct(finance.revenueGrowthPercent)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Year to date · revenue
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatRs(finance.revenueYtd)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Calendar year to today
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Rolling 12 months
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatRs(finance.revenueRolling12Months)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {finance.completedOrdersRolling12Months} completed orders
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Avg order value · this month
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatRs(finance.avgOrderValueThisMonth)}
              </p>
              <p className="mt-1 text-sm text-slate-600">Completed only</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Order volume · this month
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {finance.ordersThisMonth}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Excl. cancelled · MoM {formatPct(finance.orderGrowthPercent)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Last month · revenue
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatRs(finance.revenueLastMonth)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {finance.completedOrdersLastMonth} completed
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Month
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">
                    Completed revenue
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">
                    Completed orders
                  </th>
                </tr>
              </thead>
              <tbody>
                {finance.monthlyTrend.map((row) => (
                  <tr
                    key={row.monthKey}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-800">{row.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                      {formatRs(row.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {row.completedOrders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
}
