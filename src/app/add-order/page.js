// pages/add-order.js
import AddOrderClient from "@/components/AddOrderClient";
import Sidebar from "@/components/Sidebar";

export default function AddOrderPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4">Add Order</h1>
        <AddOrderClient />
      </div>
    </div>
  );
}
