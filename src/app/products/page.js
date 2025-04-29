import Sidebar from "../../components/Sidebar";
import ProductsTableServer from "@/components/ProductsTableServer";

export default function Products() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <ProductsTableServer />
      </div>
    </div>
  );
}
