"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaTrashAlt } from "react-icons/fa";
import { FcProcess } from "react-icons/fc";
import { Eye, Printer } from "lucide-react";
import Pagination from "./Pagination";
import ReceiptClient from "./ReceiptClient";
import { getReceiptNumber } from "@/lib/receiptNumber";

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [messagePopup, setMessagePopup] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);

  const fetchOrders = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get("/api/get-orders", {
        params: {
          page,
          pageSize: ordersPerPage,
          statusFilter,
          searchQuery,
        },
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
      setTotalOrders(response.data.totalOrders ?? 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    if (!messagePopup) return;
    const t = setTimeout(() => setMessagePopup(null), 4000);
    return () => clearTimeout(t);
  }, [messagePopup]);

  const allOnPageSelected =
    orders.length > 0 && orders.every((o) => selectedIds.has(o.id));
  const selectedOnPageCount = orders.filter((o) => selectedIds.has(o.id))
    .length;

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedIdList = () => [...selectedIds];

  const postBulk = async (body) => {
    setBulkLoading(true);
    try {
      const { data } = await axios.post("/api/bulk-orders", body);
      setSelectedIds(new Set());
      const n = data.updated ?? data.deleted ?? 0;
      setMessagePopup({
        type: "success",
        message:
          body.action === "delete"
            ? `Deleted ${n} order(s).`
            : `Updated ${n} order(s).`,
      });
      await fetchOrders(currentPage);
    } catch (error) {
      console.error(error);
      setMessagePopup({
        type: "error",
        message:
          error.response?.data?.error || "Bulk action failed. Try again.",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkCompleteSelected = () => {
    const ids = selectedIdList();
    if (ids.length === 0) return;
    if (
      !window.confirm(`Mark ${ids.length} selected order(s) as completed?`)
    )
      return;
    postBulk({
      action: "setStatus",
      scope: "page",
      orderIds: ids,
      status: "completed",
    });
  };

  const bulkProcessingSelected = () => {
    const ids = selectedIdList();
    if (ids.length === 0) return;
    if (
      !window.confirm(`Mark ${ids.length} selected order(s) as processing?`)
    )
      return;
    postBulk({
      action: "setStatus",
      scope: "page",
      orderIds: ids,
      status: "processing",
    });
  };

  const bulkCancelSelected = () => {
    const ids = selectedIdList();
    if (ids.length === 0) return;
    if (!window.confirm(`Cancel ${ids.length} selected order(s)?`)) return;
    postBulk({
      action: "setStatus",
      scope: "page",
      orderIds: ids,
      status: "cancelled",
    });
  };

  const bulkDeleteSelected = () => {
    const ids = selectedIdList();
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Permanently delete ${ids.length} selected order(s)? This cannot be undone.`
      )
    )
      return;
    postBulk({
      action: "delete",
      scope: "page",
      orderIds: ids,
    });
  };

  const bulkMarkAllMatchingCompleted = () => {
    if (
      !window.confirm(
        `Set ALL orders matching the current filters to "completed"?\n\nThis affects ${totalOrders} order(s).`
      )
    )
      return;
    postBulk({
      action: "setStatus",
      scope: "filter",
      statusFilter,
      searchQuery,
      status: "completed",
    });
  };

  const updateOrderStatus = async (orderId, status) => {
    setLoadingOrderId(orderId);
    try {
      await axios.post("/api/update-order-status", {
        orderId,
        status,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: { ...order.status, status: status } }
            : order
        )
      );

      setMessagePopup({
        type: "success",
        message: `Order ${status} successfully!`,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      setMessagePopup({
        type: "error",
        message: "Failed to update order status.",
      });
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete("/api/delete-order", { data: { id } });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchOrders(currentPage);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const indexOfFirstOrder = (currentPage - 1) * ordersPerPage;
  return (
    <div className="min-w-0">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-4">
        <div className="min-w-0">
          <label className="block text-sm font-medium text-slate-700">
            Filter by status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="mt-1 w-full sm:w-auto min-w-[12rem] p-2 border border-slate-300 rounded-md bg-white text-slate-900"
          >
            <option value="all">All</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="completed">Complete</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="w-full lg:max-w-md min-w-0">
          <label className="block text-sm font-medium text-slate-700 sr-only">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by customer, service, or contact"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"
          />
        </div>
      </div>

      {!loading && orders.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">
              {selectedOnPageCount}
            </span>{" "}
            selected on this page ·{" "}
            <span className="font-medium text-slate-800">{totalOrders}</span>{" "}
            match filters
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkLoading || selectedIds.size === 0}
              onClick={bulkCompleteSelected}
              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-40"
            >
              Complete selected
            </button>
            <button
              type="button"
              disabled={bulkLoading || selectedIds.size === 0}
              onClick={bulkProcessingSelected}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-40"
            >
              Processing selected
            </button>
            <button
              type="button"
              disabled={bulkLoading || selectedIds.size === 0}
              onClick={bulkCancelSelected}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-40"
            >
              Cancel selected
            </button>
            <button
              type="button"
              disabled={bulkLoading || selectedIds.size === 0}
              onClick={bulkDeleteSelected}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
            >
              Delete selected
            </button>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
            <span className="w-full text-xs font-medium uppercase tracking-wide text-slate-500 sm:w-auto sm:mr-2">
              All matching filters
            </span>
            <button
              type="button"
              disabled={bulkLoading || totalOrders === 0}
              onClick={bulkMarkAllMatchingCompleted}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-40"
            >
              Mark all completed
            </button>
          </div>
        </div>
      )}

      <div className="-mx-1 touch-pan-x overflow-x-auto rounded-lg border border-slate-200 bg-white px-1 shadow-sm sm:mx-0 sm:px-0">
        <table className="w-full min-w-[720px] text-left text-sm md:min-w-[900px] lg:min-w-[1020px]">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="py-3 px-2 w-10">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleSelectAllOnPage}
                  disabled={loading || orders.length === 0}
                  className="h-4 w-4 rounded border-slate-500"
                  title="Select all on this page"
                />
              </th>
              <th className="py-3 px-3 font-medium whitespace-nowrap">#</th>
              <th className="py-3 px-3 font-medium">Customer</th>
              <th className="py-3 px-3 font-medium">Service</th>
              <th className="py-3 px-3 font-medium whitespace-nowrap">
                Receipt no.
              </th>
              <th className="py-3 px-3 font-medium whitespace-nowrap">
                Status
              </th>
              <th className="py-3 px-3 font-medium whitespace-nowrap text-right">
                Subtotal
              </th>
              <th className="py-3 px-3 font-medium whitespace-nowrap">Date</th>
              <th className="py-3 px-3 font-medium text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(ordersPerPage)].map((_, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td colSpan={9} className="p-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-10 px-4 text-center text-slate-500"
                >
                  No orders match your filters.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 odd:bg-slate-50/80"
                >
                  <td className="py-3 px-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleOne(order.id)}
                      className="h-4 w-4 rounded border-slate-400"
                    />
                  </td>
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {indexOfFirstOrder + index + 1}
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-medium max-w-[140px] break-words">
                    {order?.customer.name}
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-[120px] break-words">
                    {order?.service}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                    {getReceiptNumber(order)}
                  </td>
                  <td className="py-3 px-3">
                    {order?.status?.status === "received" && (
                      <span className="text-blue-600 font-semibold">
                        Received
                      </span>
                    )}
                    {order?.status?.status === "processing" && (
                      <span className="text-orange-600 font-semibold">
                        Processing
                      </span>
                    )}
                    {order?.status?.status === "completed" && (
                      <span className="text-green-600 font-semibold">
                        Completed
                      </span>
                    )}
                    {order?.status?.status === "cancelled" && (
                      <span className="text-red-600 font-semibold">
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-800 whitespace-nowrap">
                    {order.subtotal ?? "—"}
                  </td>
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        type="button"
                        title="View order"
                        onClick={() => setViewingOrder(order)}
                        className="p-1.5 rounded-md hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4 text-slate-700" />
                      </button>
                      <button
                        type="button"
                        title="Print receipt"
                        onClick={() => setReceiptOrder(order)}
                        className="p-1.5 rounded-md hover:bg-slate-100"
                      >
                        <Printer className="h-4 w-4 text-slate-700" />
                      </button>
                      <button
                        type="button"
                        title="Mark completed"
                        onClick={() =>
                          updateOrderStatus(order.id, "completed")
                        }
                        disabled={
                          loadingOrderId === order.id || bulkLoading
                        }
                        className={`p-1.5 rounded-md hover:bg-slate-100 ${
                          loadingOrderId === order.id ? "opacity-50" : ""
                        }`}
                      >
                        <FaCheckCircle className="text-green-600 hover:text-green-700 text-lg" />
                      </button>
                      <button
                        type="button"
                        title="Cancel order"
                        onClick={() =>
                          updateOrderStatus(order.id, "cancelled")
                        }
                        disabled={
                          loadingOrderId === order.id || bulkLoading
                        }
                        className={`p-1.5 rounded-md hover:bg-slate-100 ${
                          loadingOrderId === order.id ? "opacity-50" : ""
                        }`}
                      >
                        <FaTimesCircle className="text-red-600 hover:text-red-700 text-lg" />
                      </button>
                      <button
                        type="button"
                        title="Mark processing"
                        onClick={() =>
                          updateOrderStatus(order.id, "processing")
                        }
                        disabled={
                          loadingOrderId === order.id || bulkLoading
                        }
                        className={`p-1.5 rounded-md hover:bg-slate-100 ${
                          loadingOrderId === order.id ? "opacity-50" : ""
                        }`}
                      >
                        <FcProcess className="text-xl" />
                      </button>
                      <button
                        type="button"
                        title="Delete order"
                        onClick={() => handleDelete(order.id)}
                        disabled={
                          loadingOrderId === order.id || bulkLoading
                        }
                        className={`p-1.5 rounded-md hover:bg-slate-100 ${
                          loadingOrderId === order.id ? "opacity-50" : ""
                        }`}
                      >
                        <FaTrashAlt className="text-slate-600 hover:text-slate-800 text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        disabled={loading}
      />

      {messagePopup && (
        <div
          className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            messagePopup.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {messagePopup.message}
        </div>
      )}

      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Order details
                </h3>
                <p className="text-sm text-slate-600">
                  Receipt: {getReceiptNumber(viewingOrder)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
              <p><span className="font-medium text-slate-900">Customer:</span> {viewingOrder.customer?.name}</p>
              <p><span className="font-medium text-slate-900">Contact:</span> {viewingOrder.customer?.contact || "—"}</p>
              <p><span className="font-medium text-slate-900">Service:</span> {viewingOrder.service}</p>
              <p><span className="font-medium text-slate-900">Status:</span> {viewingOrder.status?.status}</p>
              <p><span className="font-medium text-slate-900">Date:</span> {new Date(viewingOrder.createdAt).toLocaleDateString("en-GB")}</p>
              <p><span className="font-medium text-slate-900">Subtotal:</span> Rs {Number(viewingOrder.subtotal || 0).toFixed(2)}</p>
              <p><span className="font-medium text-slate-900">Delivery:</span> Rs {Number(viewingOrder.deliveryCharge || 0).toFixed(2)}</p>
              <p><span className="font-medium text-slate-900">Discount:</span> Rs {Number(viewingOrder.discount || 0).toFixed(2)}</p>
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">Qty</th>
                    <th className="px-3 py-2 text-right">Unit</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewingOrder.items || []).map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{item.product}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setViewingOrder(null);
                  setReceiptOrder(viewingOrder);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                <Printer className="h-4 w-4" />
                Print receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptOrder && (
        <ReceiptClient
          data={receiptOrder}
          receiptNumber={getReceiptNumber(receiptOrder)}
          issuedAt={receiptOrder.createdAt}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
}
