// pages/add-order.js
import AddOrder from "../../components/AddOrder";
import Sidebar from "@/components/Sidebar";

export default function AddOrderPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Add Order</h1>
        <AddOrder />
      </div>
    </div>
  );
}
