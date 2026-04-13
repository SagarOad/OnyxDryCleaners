import AdminShell from "@/components/AdminShell";
import ProductsTableServer from "@/components/ProductsTableServer";

export default function Products() {
  return (
    <AdminShell title="Products & pricing">
      <p className="text-slate-600 text-sm mb-4 max-w-2xl">
        Update standard and urgent rates anytime. Renaming changes the display
        name only; the internal code stays the same for existing orders.
      </p>
      <ProductsTableServer />
    </AdminShell>
  );
}
