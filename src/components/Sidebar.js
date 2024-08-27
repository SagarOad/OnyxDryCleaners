"use client";
import Link from "next/link";
import { FaListAlt, FaUsers, FaPlus, FaHome } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname(); // Get current path

  // Define a helper function to check active state
  const isActive = (path) => pathname === path;

  return (
    <div className=" overflow-y-auto w-64 bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-center mt-10">
        <h1 className="text-2xl font-bold tracking-wide">Dashboard</h1>
      </div>
      <nav className="mt-10">
        <Link href="/">
          <button
            className={`flex items-center py-3 px-4 w-full text-left text-sm font-semibold transition-colors duration-300 rounded-md ${
              isActive("/") ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <FaHome className="mr-3 text-lg" />
            Dashboard
          </button>
        </Link>

        <Link href="/add-order">
          <button
            className={`flex items-center py-3 px-4 w-full text-left text-sm font-semibold transition-colors duration-300 rounded-md ${
              isActive("/add-order") ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <FaPlus className="mr-3 text-lg" />
            Add Order
          </button>
        </Link>

        <Link href="/orders">
          <button
            className={`flex items-center py-3 px-4 w-full text-left text-sm font-semibold transition-colors duration-300 rounded-md ${
              isActive("/orders") ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <FaListAlt className="mr-3 text-lg" />
            Orders
          </button>
        </Link>

        <Link href="/customers">
          <button
            className={`flex items-center py-3 px-4 w-full text-left text-sm font-semibold transition-colors duration-300 rounded-md ${
              isActive("/customers") ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <FaUsers className="mr-3 text-lg" />
            Customers
          </button>
        </Link>
      </nav>
    </div>
  );
}
