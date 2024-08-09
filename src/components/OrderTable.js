"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("");



  const updateOrderStatus = async (orderId, status) => {
    setLoadingOrderId(orderId);
    setLoadingStatus(status);

    try {
      const response = await axios.post("/api/update-order-status", {
        orderId,
        status,
      });

      const updatedOrder = response.data;

      // Update the local state to reflect the change in the UI
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id
            ? { ...order, status: { ...order.status, status: updatedOrder?.status?.status } }
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/get-orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [updateOrderStatus]);

  // Filter orders based on selected status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order?.status?.status === statusFilter);

  // Status icons
  const statusIcons = {
    processing: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="3"
        stroke="currentColor"
        className="size-6 text-orange-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
    completed: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="3"
        stroke="currentColor"
        className="size-6 text-green-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
    cancelled: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="3"
        stroke="currentColor"
        className="size-6 text-red-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-700">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded"
        >
          <option value="all">All</option>
          <option value="processing">Processing</option>
          <option value="completed">Complete</option>
          <option value="cancelled">Canceled</option>
        </select>
      </div>

      <table className="min-w-full bg-white">
        <thead className="text-left">
          <tr>
            <th className="py-4 px-6">Order ID</th>
            <th className="py-4 px-6">Customer</th>
            <th className="py-4 px-6">Service</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6">Subtotal</th>
            <th className="py-4 px-6">Delivery Charge</th>
            <th className="py-4 px-6">Discount</th>
            <th className="py-4 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td className="py-4 px-6">{order?.id}</td>
              <td className="py-4 px-6">{order?.customer.name}</td>
              <td className="py-4 px-6">{order?.service}</td>
              <td className="py-4 px-6 flex items-center">
                {order?.status?.status === "processing" &&
                  statusIcons.processing}
                {order?.status?.status === "completed" && statusIcons.completed}
                {order?.status?.status === "cancelled" && statusIcons.cancelled}
              </td>
              <td className="py-4 px-6">
                Rs:{" "}
                <span className=" font-bold">
                  {order?.items?.reduce((acc, item) => acc + item.amount, 0)}
                </span>
              </td>
              <td className="py-4 px-6">
                Rs: <span className=" font-bold">{order?.deliveryCharge}</span>
              </td>
              <td className="py-4 px-6">{order?.discount}%</td>
              <td className="py-4 px-6">
                <button
                  onClick={() => updateOrderStatus(order.id, "processing")}
                  className={`mr-2 px-4 text-white py-2 ${
                    loadingOrderId === order.id && loadingStatus === "processing"
                      ? "bg-blue-500 cursor-not-allowed"
                      : "bg-blue-700"
                  }`}
                  disabled={
                    loadingOrderId === order.id && loadingStatus === "processing"
                  }
                >
                  {loadingOrderId === order.id &&
                  loadingStatus === "processing"
                    ? "Loading..."
                    : "Processing"}
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, "completed")}
                  className={`mr-2 px-4 text-white py-2 ${
                    loadingOrderId === order.id && loadingStatus === "completed"
                      ? "bg-green-500 cursor-not-allowed"
                      : "bg-green-700"
                  }`}
                  disabled={
                    loadingOrderId === order.id && loadingStatus === "completed"
                  }
                >
                  {loadingOrderId === order.id && loadingStatus === "completed"
                    ? "Loading..."
                    : "Complete"}
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, "cancelled")}
                  className={`px-4 text-white py-2 ${
                    loadingOrderId === order.id && loadingStatus === "cancelled"
                      ? "bg-red-500 cursor-not-allowed"
                      : "bg-red-700"
                  }`}
                  disabled={
                    loadingOrderId === order.id && loadingStatus === "cancelled"
                  }
                >
                  {loadingOrderId === order.id && loadingStatus === "cancelled"
                    ? "Loading..."
                    : "Cancel"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
