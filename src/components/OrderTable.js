"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaTrashAlt,
} from "react-icons/fa";

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [loading, setLoading] = useState(true); // New loading state

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/get-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
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
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== updatedOrder.id)
      );

      console.log("Order deleted successfully:", updatedOrder);
    } catch (error) {
      console.error("Failed to delete order:", error);
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

      console.log("Order status updated successfully:", updatedOrder);
    } catch (error) {
      console.error("Failed to update order status:", error);
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
            <option value="cancelled">Canceled</option>
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
          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={order.id} className="border-b">
                <td className="py-4 px-6">{indexOfFirstOrder + index + 1}</td>
                <td className="py-4 px-6">{order?.customer.name}</td>
                <td className="py-4 px-6">{order?.service}</td>
                <td className="py-4 px-6">
                  {order?.status?.status === "received" && (
                    <span className="text-blue-600 font-semibold">Received</span>
                  )}
                  {order?.status?.status === "processing" && (
                    <span className="text-orange-600 font-semibold">
                      Processing
                    </span>
                  )}
                  {order?.status?.status === "completed" && (
                    <span className="text-green-600 font-semibold">Complete</span>
                  )}
                  {order?.status?.status === "cancelled" && (
                    <span className="text-red-600 font-semibold">Canceled</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  Rs:{" "}
                  <span className="font-bold">
                    {order?.items?.reduce((acc, item) => acc + item.amount, 0)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  Rs: <span className="font-bold">{order?.deliveryCharge}</span>
                </td>
                <td className="py-4 px-6">{order?.discount}%</td>
                <td className="py-4 px-6 flex space-x-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, "processing")}
                    className={`p-2 rounded-full ${
                      loadingOrderId === order.id &&
                      loadingStatus === "processing"
                        ? "bg-orange-500 cursor-not-allowed"
                        : "bg-orange-600"
                    }`}
                    disabled={
                      loadingOrderId === order.id &&
                      loadingStatus === "processing"
                    }
                  >
                    <FaSyncAlt className="text-white" />
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, "completed")}
                    className={`p-2 rounded-full ${
                      loadingOrderId === order.id &&
                      loadingStatus === "completed"
                        ? "bg-green-500 cursor-not-allowed"
                        : "bg-green-600"
                    }`}
                    disabled={
                      loadingOrderId === order.id &&
                      loadingStatus === "completed"
                    }
                  >
                    <FaCheckCircle className="text-white" />
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className={`p-2 rounded-full ${
                      loadingOrderId === order.id && loadingStatus === "delete"
                        ? "bg-red-500 cursor-not-allowed"
                        : "bg-red-600"
                    }`}
                    disabled={
                      loadingOrderId === order.id && loadingStatus === "delete"
                    }
                  >
                    <FaTrashAlt className="text-white" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
