import AddOrderClient from "@/components/AddOrderClient";
import AdminShell from "@/components/AdminShell";

export default function AddOrderPage() {
  return (
    <AdminShell title="Add order">
      <AddOrderClient />
    </AdminShell>
  );
}
