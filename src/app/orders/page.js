import AdminShell from "@/components/AdminShell";
import OrderTable from "@/components/OrderTable";

export default function Orders() {
  return (
    <AdminShell title="Orders">
      <OrderTable />
    </AdminShell>
  );
}
