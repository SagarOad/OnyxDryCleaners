"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagePopup, setMessagePopup] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/get-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deleteOrder = async (orderId) => {
    setLoadingOrderId(orderId);
    setLoadingStatus("delete");

    try {
      const response = await axios.post("/api/update-order-live-status", {
        orderId,
        liveStatus: "delete",
      });

      const updatedOrder = response.data;

      // Animation for row removal
      setTimeout(() => {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== updatedOrder.id)
        );
      }, 300);

      setMessagePopup({
        type: "success",
        message: "Order deleted successfully!",
      });

      console.log("Order deleted successfully:", updatedOrder);
    } catch (error) {
      console.error("Failed to delete order:", error);
      setMessagePopup({
        type: "error",
        message: "Failed to delete order.",
      });
    } finally {
      setLoadingOrderId(null);
      setLoadingStatus("");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setLoadingOrderId(orderId);
    setLoadingStatus(status);

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

      console.log("Order status updated successfully:", updatedOrder);
    } catch (error) {
      console.error("Failed to update order status:", error);
      setMessagePopup({
        type: "error",
        message: "Failed to update order status.",
      });
    } finally {
      setLoadingOrderId(null);
      setLoadingStatus("");
    }
  };

  const filteredOrders = orders
    .filter((order) =>
      statusFilter === "all" ? true : order?.status?.status === statusFilter
    )
    .filter((order) =>
      searchQuery === ""
        ? true
        : order?.customer?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order?.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

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
            placeholder="Search by customer or service"
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
              <th className="py-4 px-6 font-semibold">#</th>
              <th className="py-4 px-6 font-semibold">Customer</th>
              <th className="py-4 px-6 font-semibold">Service</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold">Subtotal</th>
              <th className="py-4 px-6 font-semibold">Delivery Charge</th>
              <th className="py-4 px-6 font-semibold">Discount</th>
              <th className="py-4 px-6 font-semibold">Actions</th>
            </tr>
          </thead>
          <TransitionGroup component="tbody">
            {currentOrders.map((order, index) => (
              <CSSTransition key={order.id} timeout={300} classNames="fade">
                <tr className="border-b">
                  <td className="py-4 px-6">
                    {indexOfFirstOrder + index + 1}
                  </td>
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
                    {order?.status?.status === "pending" && (
                      <span className="text-yellow-600 font-semibold">
                        Pending
                      </span>
                    )}
                    {order?.status?.status === "cancelled" && (
                      <span className="text-red-600 font-semibold">
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">Rs {order?.subtotal}</td>
                  <td className="py-4 px-6">
                    Rs {order?.deliveryCharge}
                  </td>
                  <td className="py-4 px-6">
                    % {order?.discount ? order.discount : "0"}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "completed")
                      }
                      className="text-green-600 hover:text-green-800"
                      disabled={loadingOrderId === order.id || order.status?.status === "completed"}
                    >
                      <FaCheckCircle />
                    </button>
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "processing")
                      }
                      className="text-yellow-600 hover:text-yellow-800 ml-2"
                      disabled={loadingOrderId === order.id || order.status?.status === "pending"}
                    >
                      <FaTimesCircle />
                    </button>
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "cancelled")
                      }
                      className="text-red-600 hover:text-red-800 ml-2"
                      disabled={loadingOrderId === order.id || order.status?.status === "cancelled"}
                    >
                      <FaTimesCircle />
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="text-red-600 hover:text-red-800 ml-2"
                      disabled={loadingOrderId === order.id}
                    >
                      <FaTrashAlt />
                    </button>
                    {loadingOrderId === order.id && (
                      <FaSyncAlt className="animate-spin ml-2" />
                    )}
                  </td>
                </tr>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Next
        </button>
      </div>

      {/* Message Popup */}
      {messagePopup && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}
        >
          <div
            className={`bg-white p-6 rounded-lg shadow-lg`}
          >
            <p
              className={`text-lg ${messagePopup.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
            >
              {messagePopup.message}
            </p>
            <button
              onClick={() => setMessagePopup(null)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
