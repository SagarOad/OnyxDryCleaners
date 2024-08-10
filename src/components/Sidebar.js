import Link from "next/link";
import { FaListAlt, FaUsers, FaPlus } from "react-icons/fa"; // Import icons

export default function Sidebar() {
  return (
    <div className="h-[100vh] overflow-y-auto w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg">
      <div className="flex items-center justify-center mt-10">
        <h1 className="text-2xl font-bold tracking-wide">Dashboard</h1>
      </div>
      <nav className="mt-10">
        <Link href="/orders">
          <button className="flex items-center py-3 px-4 w-full text-left text-sm font-semibold hover:bg-gray-700 transition-colors duration-300">
            <FaListAlt className="mr-3 text-lg" />
            Orders
          </button>
        </Link>
        <Link href="/customers">
          <button className="flex items-center py-3 px-4 w-full text-left text-sm font-semibold hover:bg-gray-700 transition-colors duration-300">
            <FaUsers className="mr-3 text-lg" />
            Customers
          </button>
        </Link>
        <Link href="/add-order">
          <button className="flex items-center py-3 px-4 w-full text-left text-sm font-semibold hover:bg-gray-700 transition-colors duration-300">
            <FaPlus className="mr-3 text-lg" />
            Add Order
          </button>
        </Link>
      </nav>
    </div>
  );
}
