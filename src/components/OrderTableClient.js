"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import EditCustomerModal from "./EditCustomerModal";

const CustomerTableClient = () => {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ordersPerPage = 15;
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  useEffect(() => {
    fetchCustomers(); // This will now handle both search and pagination
  }, [currentPage, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/get-customers", {
        params: {
          searchQuery,
          page: currentPage,
          limit: ordersPerPage,
        },
      });

      setCustomers(response.data.existingCustomers);
      // Optional: if you want to paginate manually (on frontend)
      setTotalPages(
        Math.ceil(response.data.totalExistingCustomers / ordersPerPage)
      );
    } catch (error) {
      console.error("Error fetching existing customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleEditSubmit = async (updatedCustomer) => {
    try {
      await axios.put(`/api/update-customer`, updatedCustomer);

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

  const renderPagination = () => {
    return (
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-3 py-1 ${
            currentPage === 1 ? "bg-gray-400" : "bg-blue-600 text-white"
          } rounded-md`}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 mx-1 ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            } rounded-md`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className={`px-3 py-1 ${
            currentPage === totalPages
              ? "bg-gray-400"
              : "bg-blue-600 text-white"
          } rounded-md`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Loading Placeholder */}
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
              {Array.from({ length: ordersPerPage }).map((_, index) => (
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
        // Customer Table
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Contact</th>
              <th className="py-2 px-4">Address</th>
              <th className="py-2 px-4">Service</th>
              <th className="py-2 px-4">Actions</th> {/* New column */}
            </tr>
          </thead>
          <TransitionGroup component="tbody">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <CSSTransition
                  key={customer.id}
                  timeout={300}
                  classNames="fade"
                >
                  <tr className="border-b">
                    <td className="py-2 px-4">{customer.name}</td>
                    <td className="py-2 px-4">{customer.contact}</td>
                    <td className="py-2 px-4">{customer.address || "N/A"}</td>
                    <td className="py-2 px-4">{customer.service || "N/A"}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => {
                          setEditingCustomer(customer);
                          setIsEditModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-3 mr-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </CSSTransition>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 px-6 text-center">
                  No customers found
                </td>
              </tr>
            )}
          </TransitionGroup>
        </table>
      )}

      {/* Pagination */}
      {renderPagination()}
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
};

export default CustomerTableClient;
