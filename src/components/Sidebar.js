"use client";
import Link from "next/link";
import { FaListAlt, FaUsers, FaPlus, FaHome, FaTag } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname(); // Get current path

  const isActive = (path) => pathname === path;

  const navLinks = [
    { href: "/", label: "Dashboard", icon: <FaHome /> },
    { href: "/add-order", label: "Add Order", icon: <FaPlus /> },
    { href: "/orders", label: "Orders", icon: <FaListAlt /> },
    { href: "/customers", label: "Customers", icon: <FaUsers /> },
    { href: "/add-existing-customer", label: "Add Customer", icon: <FaTag /> },
    { href: "/products", label: "Products", icon: <FaTag /> },
    { href: "/add-product", label: "Add Product", icon: <FaTag /> },
  ];

  return (
    <>
      {/* Sidebar for large screens */}
      <div className="hidden md:flex flex-col w-64 bg-gray-900 text-white shadow-lg h-screen">
        <div className="flex items-center justify-center mt-10">
          <h1 className="text-2xl font-bold tracking-wide">Onyx</h1>
        </div>
        <nav className="mt-10">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <button
                className={`flex items-center py-3 px-4 w-full text-left text-sm font-semibold transition-colors duration-300 rounded-md ${
                  isActive(link.href) ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                {link.label}
              </button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Navigation for small screens */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-900 text-white flex justify-around py-2 shadow-lg">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <button
              className={`flex flex-col items-center px-2 ${
                isActive(link.href) ? "text-blue-400" : "hover:text-gray-400"
              }`}
            >
              <span className="text-base">{link.icon}</span> {/* Smaller icon */}
              <span className="text-xs">{link.label}</span> {/* Smaller text */}
            </button>
          </Link>
        ))}
      </div>
    </>
  );
}
