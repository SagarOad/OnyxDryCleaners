"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Download, FileText, Loader2 } from "lucide-react";

function ymd(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function presets() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();

  const startOfThisMonth = new Date(Date.UTC(y, m, 1));
  const endToday = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

  const startLastMonth = new Date(Date.UTC(y, m - 1, 1));
  const endLastMonth = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

  const startThisYear = new Date(Date.UTC(y, 0, 1));
  const endThisYear = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));

  const startLastYear = new Date(Date.UTC(y - 1, 0, 1));
  const endLastYear = new Date(Date.UTC(y - 1, 11, 31, 23, 59, 59, 999));

  const allTimeStart = new Date(Date.UTC(2000, 0, 1));

  return [
    {
      id: "this_month",
      label: "This month",
      from: ymd(startOfThisMonth),
      to: ymd(endToday),
    },
    {
      id: "last_month",
      label: "Last month",
      from: ymd(startLastMonth),
      to: ymd(endLastMonth),
    },
    {
      id: "this_year",
      label: "This calendar year",
      from: ymd(startThisYear),
      to: ymd(endToday),
    },
    {
      id: "full_year",
      label: "Full calendar year (Jan–Dec)",
      from: ymd(startThisYear),
      to: ymd(endThisYear),
    },
    {
      id: "last_year",
      label: "Last calendar year",
      from: ymd(startLastYear),
      to: ymd(endLastYear),
    },
    {
      id: "all_time",
      label: "All time",
      from: ymd(allTimeStart),
      to: ymd(endToday),
    },
  ];
}

function formatRs(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `Rs ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(Math.round(n))}`;
}

export default function LedgerReportPanel() {
  const presetList = useMemo(() => presets(), []);
  const [from, setFrom] = useState(presetList[0].from);
  const [to, setTo] = useState(presetList[0].to);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const applyPreset = (p) => {
    setFrom(p.from);
    setTo(p.to);
    setReport(null);
    setError(null);
  };

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ledger-report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load report");
      setReport(data);
    } catch (e) {
      setReport(null);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ledger-report?format=csv&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ledger-report-${from}-to-${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-900">
          <FileText className="h-5 w-5 text-slate-600" />
          <h2 className="text-base font-semibold">Revenue & profit report</h2>
        </div>
        <p className="text-xs text-slate-500 sm:max-w-md sm:text-right">
          Counts every order except{" "}
          <strong className="text-slate-700">cancelled</strong>. Revenue is the
          net order total (stored subtotal already includes discount &amp;
          delivery). Net profit = revenue − outsourcing.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {presetList.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            From (UTC date)
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setReport(null);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            To (UTC date)
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setReport(null);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadReport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarRange className="h-4 w-4" />
            )}
            Generate report
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download CSV
          </button>
        </div>
      </div>

      {error && (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      {report?.summary && (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">Period:</span>{" "}
            {report.from} → {report.to}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                Orders (excl. cancelled)
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {report.summary.orderCount}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-medium uppercase text-emerald-800">
                Total revenue
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-900">
                {formatRs(report.summary.totalRevenue)}
              </p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-xs font-medium uppercase text-amber-900">
                Outsourcing cost
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-950">
                {formatRs(report.summary.totalOutsourcing)}
              </p>
            </div>
            <div className="rounded-lg border border-violet-100 bg-violet-50/60 p-4">
              <p className="text-xs font-medium uppercase text-violet-800">
                Net profit (rev − outsource)
              </p>
              <p className="mt-1 text-2xl font-semibold text-violet-900">
                {formatRs(report.summary.netProfitAfterOutsourcing)}
              </p>
            </div>
          </div>
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Stored <strong>profit</strong> field total:{" "}
            {formatRs(report.summary.totalProfitStored)} — should match net
            profit unless rows were edited manually.
          </p>
          <p className="text-xs text-slate-500">{report.summary.criteria}</p>

          {report.monthly?.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-3 py-2 font-medium">Month</th>
                    <th className="px-3 py-2 font-medium text-right">Orders</th>
                    <th className="px-3 py-2 font-medium text-right">
                      Revenue
                    </th>
                    <th className="px-3 py-2 font-medium text-right">
                      Net profit
                    </th>
                    <th className="px-3 py-2 font-medium text-right">
                      Outsource
                    </th>
                    <th className="px-3 py-2 font-medium text-right text-slate-400">
                      DB profit Σ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.monthly.map((row) => (
                    <tr
                      key={row.monthKey}
                      className="border-b border-slate-100 odd:bg-slate-50/50"
                    >
                      <td className="px-3 py-2 text-slate-800">{row.label}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                        {row.orderCount}
                      </td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums text-slate-900">
                        {formatRs(row.revenue)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-violet-900">
                        {formatRs(row.netProfit)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {formatRs(row.outsourcing)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-500">
                        {formatRs(row.profitStored)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
