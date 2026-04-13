"use client";

import AdminShell from "@/components/AdminShell";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Users,
  Package,
  Inbox,
  Loader2,
  TrendingUp,
  Banknote,
  CalendarDays,
  Activity,
  Percent,
} from "lucide-react";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

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

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-slate-900 opacity-[0.06]" />
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent ?? "bg-slate-100 text-slate-700"}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
          {sub ? (
            <p className="mt-1 text-xs text-slate-500">{sub}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <AdminShell title="Dashboard">
      <div className="mb-8 h-4 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-slate-100 bg-slate-100/80"
          />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl border border-slate-100 bg-slate-100/80" />
        <div className="h-80 animate-pulse rounded-xl border border-slate-100 bg-slate-100/80" />
      </div>
    </AdminShell>
  );
}

export default function Home() {
  const [summary, setSummary] = useState({
    customerCount: 0,
    orderCount: 0,
    receivedOrdersCount: 0,
    processingOrdersCount: 0,
    completedOrdersCount: 0,
    cancelledOrdersCount: 0,
    finance: defaultFinance,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/get-summary");
        if (!response.ok) {
          throw new Error("Failed to fetch summary data");
        }
        const data = await response.json();
        setSummary({
          ...data,
          finance: { ...defaultFinance, ...data.finance },
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session && session.user.role !== "admin")
    ) {
      router.push("/login");
    }
  }, [status, session, router]);

  const f = summary.finance;

  const pieOptions = useMemo(
    () => ({
      labels: ["Received", "Processing", "Completed"],
      chart: {
        type: "pie",
        fontFamily: "inherit",
        toolbar: { show: false },
      },
      legend: {
        position: "bottom",
        fontSize: "13px",
        labels: { colors: "#64748b" },
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: "12px", fontWeight: 600 },
      },
      colors: ["#2563eb", "#d97706", "#059669"],
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: { size: "0%" },
          expandOnClick: false,
        },
      },
    }),
    []
  );

  const pieSeries = useMemo(
    () => [
      summary.receivedOrdersCount,
      summary.processingOrdersCount,
      summary.completedOrdersCount,
    ],
    [
      summary.receivedOrdersCount,
      summary.processingOrdersCount,
      summary.completedOrdersCount,
    ]
  );

  const trendOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        fontFamily: "inherit",
        toolbar: { show: false },
        zoom: { enabled: false },
        sparkline: { enabled: false },
      },
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      colors: ["#0f172a"],
      dataLabels: { enabled: false },
      xaxis: {
        categories: f.monthlyTrend.map((m) => m.label),
        labels: { style: { colors: "#64748b", fontSize: "11px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#64748b", fontSize: "11px" },
          formatter: (val) =>
            val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(Math.round(val)),
        },
      },
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 4,
        padding: { left: 8, right: 8 },
      },
      tooltip: {
        y: {
          formatter: (val) => formatRs(val),
        },
      },
    }),
    [f.monthlyTrend]
  );

  const trendSeries = useMemo(
    () => [
      {
        name: "Completed revenue",
        data: f.monthlyTrend.map((m) =>
          Math.round(m.revenue ?? 0)
        ),
      },
    ],
    [f.monthlyTrend]
  );

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <AdminShell title="Dashboard">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard">
      <div className="mb-8 flex flex-col gap-1 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Operations overview
          </p>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Live metrics from your database. Revenue uses completed orders:
            subtotal + delivery − discount.
          </p>
        </div>
        <Link
          href="/finance"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 sm:mt-0"
        >
          <Banknote className="h-4 w-4" />
          Full finance breakdown
        </Link>
      </div>

      <section aria-labelledby="ops-heading">
        <h2
          id="ops-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          Operations
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Customers"
            value={summary.customerCount}
            accent="bg-sky-100 text-sky-700"
          />
          <StatCard
            icon={Package}
            label="All orders"
            value={summary.orderCount}
            accent="bg-violet-100 text-violet-700"
          />
          <StatCard
            icon={Inbox}
            label="In pipeline"
            value={summary.receivedOrdersCount + summary.processingOrdersCount}
            sub={`${summary.receivedOrdersCount} received · ${summary.processingOrdersCount} processing`}
            accent="bg-amber-100 text-amber-800"
          />
          <StatCard
            icon={Activity}
            label="Cancelled (all time)"
            value={summary.cancelledOrdersCount}
            accent="bg-rose-100 text-rose-700"
          />
        </div>
      </section>

      <section aria-labelledby="fin-heading" className="mt-10">
        <h2
          id="fin-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          Finance & growth
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Banknote}
            label="Revenue · this month"
            value={formatRs(f.revenueThisMonth)}
            sub={`${f.completedOrdersThisMonth} completed orders`}
            accent="bg-emerald-100 text-emerald-800"
          />
          <StatCard
            icon={Percent}
            label="MoM revenue change"
            value={formatPct(f.revenueGrowthPercent)}
            sub="vs last month (completed)"
            accent="bg-teal-100 text-teal-800"
          />
          <StatCard
            icon={TrendingUp}
            label="Order volume · this month"
            value={f.ordersThisMonth}
            sub={`${formatPct(f.orderGrowthPercent)} vs last month (excl. cancelled)`}
            accent="bg-indigo-100 text-indigo-800"
          />
          <StatCard
            icon={CalendarDays}
            label="Year to date · revenue"
            value={formatRs(f.revenueYtd)}
            sub={`Rolling 12 mo: ${formatRs(f.revenueRolling12Months)}`}
            accent="bg-slate-100 text-slate-800"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            icon={Package}
            label="Avg order value · this month"
            value={formatRs(f.avgOrderValueThisMonth)}
            sub="Completed orders only"
            accent="bg-cyan-100 text-cyan-800"
          />
          <StatCard
            icon={Activity}
            label="Last month revenue"
            value={formatRs(f.revenueLastMonth)}
            sub={`${f.completedOrdersLastMonth} completed`}
            accent="bg-orange-100 text-orange-800"
          />
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Pipeline mix
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Open vs completed (excludes cancelled from chart slices)
          </p>
          <div className="mt-4 min-h-[280px] w-full min-w-0">
            {pieSeries.reduce((a, b) => a + b, 0) > 0 ? (
              <ApexCharts
                options={pieOptions}
                series={pieSeries}
                type="pie"
                width="100%"
                height={300}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
                No orders in received / processing / completed yet
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Revenue trend
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Last 6 months · completed orders only
          </p>
          <div className="mt-4 min-h-[280px] w-full min-w-0">
            {f.monthlyTrend.length > 0 ? (
              <ApexCharts
                options={trendOptions}
                series={trendSeries}
                type="area"
                width="100%"
                height={300}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                No trend data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
