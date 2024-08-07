import Sidebar from '../../components/Sidebar';
import CustomerTable from '../../components/CustomerTable';

export default function Customers() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Customers</h1>
        <CustomerTable />
      </div>
    </div>
  );
}