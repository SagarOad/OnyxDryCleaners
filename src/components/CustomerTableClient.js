"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import EditCustomerModal from "./EditCustomerModal";
import Pagination from "./Pagination";

export default function CustomerTableClient() {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ordersPerPage = 15;
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
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
      setTotalPages(
        Math.ceil(response.data.totalExistingCustomers / ordersPerPage) || 1
      );
    } catch (error) {
      console.error("Error fetching existing customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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

      fetchCustomers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        disabled={loading}
      />
    );
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or contact..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full sm:max-w-md px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
        />
      </div>

      <div className="touch-pan-x overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="animate-pulse p-4 min-w-[640px]">
            <div className="h-10 bg-slate-200 rounded mb-2" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded mb-2" />
            ))}
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm text-left">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="py-3 px-3 font-medium whitespace-nowrap">#</th>
                <th className="py-3 px-3 font-medium">Customer</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap">
                  Contact
                </th>
                <th className="py-3 px-3 font-medium min-w-[140px]">Address</th>
                <th className="py-3 px-3 font-medium">Service</th>
                <th className="py-3 px-3 font-medium whitespace-nowrap text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <TransitionGroup component="tbody">
              {customers.length > 0 ? (
                customers.map((customer, index) => (
                  <CSSTransition
                    key={customer.id}
                    timeout={300}
                    classNames="fade"
                  >
                    <tr className="border-b border-slate-100 odd:bg-slate-50/80">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        {(currentPage - 1) * ordersPerPage + index + 1}
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">
                        {customer.name}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {customer.contact}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs break-words">
                        {customer.address || "—"}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {customer.service || "—"}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCustomer(customer);
                            setIsEditModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center rounded-md bg-slate-800 text-white px-3 py-1.5 text-xs font-medium mr-2 hover:bg-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                          className="inline-flex items-center justify-center rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </CSSTransition>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 px-4 text-center text-slate-500"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </TransitionGroup>
          </table>
        )}
      </div>

      {renderPagination()}

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
