"use client";
import { useState } from "react";
import axios from "axios";
import EditCustomerModal from "./EditCustomerModal";

export default function CustomerTableClient({ initialData }) {
  const [customers, setCustomers] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/get-customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    [customer.name, customer.contact, customer.address, customer.service].some(
      (field) => field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const handleEditSubmit = async (updatedCustomer) => {
    try {
      await axios.put(
        `/api/update-customer/${updatedCustomer.id}`,
        updatedCustomer
      );
      await fetchCustomers();
      setIsEditModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Customer?"))
      return;

    try {
      await axios.delete("/api/delete-customer", { data: { id } });
      fetchCustomers(); // Refresh list
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, contact, address, or service"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full max-w-md"
        />
      </div>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-4 px-6 font-semibold uppercase text-sm">#</th>
            <th className="py-4 px-6 font-semibold uppercase text-sm">Name</th>
            <th className="py-4 px-6 font-semibold uppercase text-sm">
              Contact
            </th>
            <th className="py-4 px-6 font-semibold uppercase text-sm">
              Address
            </th>
            <th className="py-4 px-6 font-semibold uppercase text-sm">
              Service
            </th>
            <th className="py-4 px-6 font-semibold uppercase text-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.map((customer, index) => (
            <tr
              key={customer.id}
              className={`border-b last:border-none ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-100 transition-colors duration-150`}
            >
              <td className="py-4 px-6 text-gray-700">
                {indexOfFirstCustomer + index + 1}
              </td>
              <td className="py-4 px-6 text-gray-700">{customer.name}</td>
              <td className="py-4 px-6 text-gray-700">{customer.contact}</td>
              <td className="py-4 px-6 text-gray-700">{customer.address}</td>
              <td className="py-4 px-6 text-gray-700">{customer.service}</td>
              <td className="py-4 px-6 text-gray-700 flex gap-2">
                <button
                  onClick={() => {
                    setEditingCustomer(customer);
                    setIsEditModalOpen(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCustomer(null);
          }}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
