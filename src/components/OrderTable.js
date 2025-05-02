"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { FcProcess } from "react-icons/fc";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [messagePopup, setMessagePopup] = useState(null);

  const fetchOrders = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get("/api/get-orders", {
        params: {
          page,
          pageSize: ordersPerPage,
          statusFilter, // Include status filter
          searchQuery, // Include search query
        },
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, statusFilter, searchQuery]);

  const updateOrderStatus = async (orderId, status) => {
    setLoadingOrderId(orderId);
    try {
      const response = await axios.post("/api/update-order-status", {
        orderId,
        status,
      });

      const updatedOrder = response.data;

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

  // delete funtion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete("/api/delete-order", { data: { id } });
      fetchOrders(); // Refresh list
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredOrders = orders
    .filter((order) =>
      statusFilter === "all" ? true : order?.status?.status === statusFilter
    )
    .filter(
      (order) =>
        searchQuery === ""
          ? true
          : order?.customer?.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order?.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order?.customer?.contact?.includes(searchQuery) // Search by contact number
    );

  const indexOfFirstOrder = (currentPage - 1) * ordersPerPage;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="block text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded"
          >
            <option value="all">All</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="completed">Complete</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by customer, service, or contact number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-24"></div>
                </th>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-48"></div>
                </th>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-36"></div>
                </th>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-52"></div>
                </th>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-36"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ordersPerPage }).map((_, index) => (
                <tr key={index} className="border-b last:border-none">
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-12"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-48"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-36"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-52"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-36"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-4 px-6 font-semibold text-left">#</th>
              <th className="py-4 px-6 font-semibold text-left">Customer</th>
              <th className="py-4 px-6 font-semibold text-left">Service</th>
              <th className="py-4 px-6 font-semibold text-left">Status</th>
              <th className="py-4 px-6 font-semibold text-left">Subtotal</th>
              <th className="py-4 px-6 font-semibold text-left">
                Delivery Charge
              </th>
              <th className="py-4 px-6 font-semibold text-left">Discount</th>
              <th className="py-4 px-6 font-semibold text-left">Create At</th>
              <th className="py-4 px-6 font-semibold text-left">Actions</th>
            </tr>
          </thead>
          <TransitionGroup component="tbody">
            {filteredOrders.map((order, index) => (
              <CSSTransition key={order.id} timeout={300} classNames="fade">
                <tr className="border-b">
                  <td className="py-4 px-6">{indexOfFirstOrder + index + 1}</td>
                  <td className="py-4 px-6">{order?.customer.name}</td>
                  <td className="py-4 px-6">{order?.service}</td>
                  <td className="py-4 px-6">
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
                  <td className="py-4 px-6">{order.subtotal}</td>
                  <td className="py-4 px-6">{order.deliveryCharge}</td>
                  <td className="py-4 px-6">{order.discount || "-"}</td>
                  <td className="py-4 px-6">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-4 px-6 flex space-x-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, "completed")}
                      disabled={loadingOrderId === order.id}
                      className={`${
                        loadingOrderId === order.id ? "opacity-50" : ""
                      }`}
                    >
                      <FaCheckCircle className="text-green-600 hover:text-green-700" />
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                      disabled={loadingOrderId === order.id}
                      className={`${
                        loadingOrderId === order.id ? "opacity-50" : ""
                      }`}
                    >
                      <FaTimesCircle className="text-red-600 hover:text-red-700" />
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "processing")}
                      disabled={loadingOrderId === order.id}
                      className={`${
                        loadingOrderId === order.id ? "opacity-50" : ""
                      }`}
                    >
                      <FcProcess />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={loadingOrderId === order.id}
                      className={`${
                        loadingOrderId === order.id ? "opacity-50" : ""
                      }`}
                    >
                      <FaTrashAlt className="text-gray-600 hover:text-gray-700" />
                    </button>
                  </td>
                </tr>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </table>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="mr-2 p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`mr-2 p-2 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {messagePopup && (
        <div
          className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 p-4 rounded ${
            messagePopup.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {messagePopup.message}
        </div>
      )}
    </div>
  );
}
