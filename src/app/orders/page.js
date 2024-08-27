// pages/orders.js
import Sidebar from '../../components/Sidebar';
import OrderTable from '../../components/OrderTable';

export default function Orders() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <OrderTable />
      </div>
    </div>
  );
}
