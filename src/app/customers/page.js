import Sidebar from "../../components/Sidebar";
import CustomerTableServer from "@/components/CustomerTableServer";

export default function Customers() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4">Customers</h1>
        <CustomerTableServer />
      </div>
    </div>
  );
}
