"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function CustomerTable() {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/get-customers");
        setCustomers(response.data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    [customer.name, customer.contact, customer.address, customer.service]
      .some(field => field.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, contact, address, or service"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      {loading ? (
        <div className="animate-pulse">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-24"></div>
                </th>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-48"></div>
                </th>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-36"></div>
                </th>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-52"></div>
                </th>
                <th className="py-4 px-6 font-semibold uppercase text-sm">
                  <div className="bg-gray-300 h-6 rounded w-36"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: customersPerPage }).map((_, index) => (
                <tr key={index} className="border-b last:border-none">
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-12"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-48"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-36"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-52"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="bg-gray-200 h-4 rounded w-36"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-4 px-6 font-semibold uppercase text-sm">#</th>
              <th className="py-4 px-6 font-semibold uppercase text-sm">Name</th>
              <th className="py-4 px-6 font-semibold uppercase text-sm">Contact</th>
              <th className="py-4 px-6 font-semibold uppercase text-sm">Address</th>
              <th className="py-4 px-6 font-semibold uppercase text-sm">Service</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.map((customer, index) => (
              <tr
                key={customer.id}
                className={`border-b last:border-none ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-colors duration-150`}
              >
                <td className="py-4 px-6 text-gray-700">{indexOfFirstCustomer + index + 1}</td>
                <td className="py-4 px-6 text-gray-700">{customer.name}</td>
                <td className="py-4 px-6 text-gray-700">{customer.contact}</td>
                <td className="py-4 px-6 text-gray-700">{customer.address}</td>
                <td className="py-4 px-6 text-gray-700">{customer.service}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
