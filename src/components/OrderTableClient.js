"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const OrderTableClient = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrdersClient();
  }, [currentPage, statusFilter, searchQuery]);

  const fetchOrdersClient = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/get-orders', {
        params: {
          page: currentPage,
          pageSize: 10,
          statusFilter,
          searchQuery,
        },
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to the first page on filter change
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 mx-1 ${
            currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
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
        <select value={statusFilter} onChange={handleStatusFilter} className="px-3 py-2 border border-gray-300 rounded-md">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          {/* Add more statuses as needed */}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Service</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Created At</th>
            </tr>
          </thead>
          <TransitionGroup component="tbody">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <CSSTransition key={order.id} timeout={300} classNames="fade">
                  <tr className="border-b">
                    <td className="py-2 px-4">{(currentPage - 1) * 10 + index + 1}</td>
                    <td className="py-2 px-4">{order.customer.name}</td>
                    <td className="py-2 px-4">{order.service}</td>
                    <td className="py-2 px-4">{order.status.status}</td>
                    <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                </CSSTransition>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 px-6 text-center">
                  No orders found
                </td>
              </tr>
            )}
          </TransitionGroup>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4">{renderPagination()}</div>
    </div>
  );
};

export default OrderTableClient;
