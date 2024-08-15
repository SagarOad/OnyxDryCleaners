import Sidebar from "../../components/Sidebar";
// import CustomerTable from "../../components/CustomerTable";
import CustomerTableServer from "@/components/CustomerTableServer";

export default function Customers() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Customers</h1>
        <CustomerTableServer />
      </div>
    </div>
  );
}
