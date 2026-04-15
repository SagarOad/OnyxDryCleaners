"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import EditLedgerEntryModal from "./EditLedgerEntryModal";
import LedgerReportPanel from "./LedgerReportPanel";
import Pagination from "./Pagination";

function formatRs(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `Rs ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(Math.round(n))}`;
}

export default function LedgerTableClient() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const pageSize = 20;

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/ledger", {
        params: {
          page: currentPage,
          pageSize,
          statusFilter,
          searchQuery,
        },
      });
      setEntries(res.data.entries);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [currentPage, statusFilter, searchQuery]);

  const mergeSaved = (order) => {
    setEntries((prev) =>
      prev.map((row) => (row.id === order.id ? { ...row, ...order } : row))
    );
  };

  return (
    <div className="min-w-0">
      <LedgerReportPanel />

      <p className="mb-4 max-w-3xl text-sm text-slate-600">
        Every row is an order (transaction). Totals use subtotal + delivery −
        discount. Editing adjusts the order record used across the app and
        reports.
      </p>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="mt-1 w-full min-w-[12rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 sm:w-auto"
          >
            <option value="all">All</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <input
          type="search"
          placeholder="Search customer, service, contact…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 lg:max-w-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-3 py-3 font-medium whitespace-nowrap">Date</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Service</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">Status</th>
              <th
                className="px-3 py-3 font-medium text-right whitespace-nowrap"
                title="Stored net total (includes discount & delivery)"
              >
                Subtotal
              </th>
              <th className="px-3 py-3 font-medium text-right whitespace-nowrap">
                Delivery
              </th>
              <th className="px-3 py-3 font-medium text-right whitespace-nowrap">
                Discount
              </th>
              <th
                className="px-3 py-3 font-medium text-right whitespace-nowrap"
                title="Same as subtotal when set; else from line items"
              >
                Revenue
              </th>
              <th className="px-3 py-3 font-medium text-right whitespace-nowrap">
                Outsource
              </th>
              <th className="px-3 py-3 font-medium text-right whitespace-nowrap">
                Net profit
              </th>
              <th className="px-3 py-3 font-medium text-right whitespace-nowrap">
                Items
              </th>
              <th className="px-3 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td colSpan={12} className="p-3">
                    <div className="h-4 animate-pulse rounded bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="py-10 text-center text-slate-500"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              entries.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 odd:bg-slate-50/60"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {new Date(row.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="max-w-[140px] px-3 py-2.5">
                    <div className="font-medium text-slate-900">
                      {row.customerName}
                    </div>
                    {row.customerContact ? (
                      <div className="text-xs text-slate-500">
                        {row.customerContact}
                      </div>
                    ) : null}
                  </td>
                  <td className="max-w-[120px] break-words px-3 py-2.5 text-slate-700">
                    {row.service}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {row.status}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-800">
                    {formatRs(row.subtotal)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-800">
                    {formatRs(row.deliveryCharge)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-800">
                    {formatRs(row.discount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium tabular-nums text-slate-900">
                    {formatRs(row.total)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-700">
                    {formatRs(row.outsourcingCost)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium tabular-nums text-violet-900">
                    {formatRs(row.netProfitAfterOutsource)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-600">
                    {row.itemCount}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      )}

      {editing && (
        <EditLedgerEntryModal
          entry={editing}
          onClose={() => setEditing(null)}
          onSaved={mergeSaved}
        />
      )}
    </div>
  );
}
