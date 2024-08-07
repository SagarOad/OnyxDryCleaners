import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-gray-800 text-white">
      <nav className="mt-10">
        <Link href="/orders">
          <button className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
            Orders
          </button>
        </Link>
        <Link href="/customers">
          <button className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
            Customers
          </button>
        </Link>
        <Link href="/add-order">
          <button className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
            Add Order
          </button>
        </Link>
      </nav>
    </div>
  );
}
