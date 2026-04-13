import AdminShell from "@/components/AdminShell";
import CustomerTableServer from "@/components/CustomerTableServer";

export default function Customers() {
  return (
    <AdminShell title="Customers">
      <CustomerTableServer />
    </AdminShell>
  );
}
