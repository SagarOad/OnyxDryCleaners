"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductTableClient = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/products-list", {
        params: { page: currentPage, pageSize, searchQuery },
      });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery]);

  const handleEdit = (id, price, urgentPrice) => {
    setEditingId(id);
    setFormState({ [id]: { price, urgentPrice } });
  };

  const handleChange = (id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id) => {
    const price = parseFloat(formState[id]?.price);
    const urgentPrice = parseFloat(formState[id]?.urgentPrice);
    if (!isNaN(price) && !isNaN(urgentPrice)) {
      await axios.put("/api/update-product-price", { id, price, urgentPrice });
      setEditingId(null);
      fetchProducts();
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search products..."
          className="border px-3 py-2 rounded-md"
        />
      </div>

      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-3 text-left">Label</th>
            <th className="p-3 text-left">Value</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Urgent Price</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="p-3"><div className="h-4 bg-gray-300 rounded w-3/4"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-300 rounded w-2/3"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-300 rounded w-1/2"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-300 rounded w-1/2"></div></td>
                <td className="p-3"><div className="h-8 bg-gray-300 rounded w-20"></div></td>
              </tr>
            ))
          ) : products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.label}</td>
                <td className="p-3">{p.value}</td>
                <td className="p-3">
                  {editingId === p.id ? (
                    <input
                      type="number"
                      value={formState[p.id]?.price || ""}
                      onChange={(e) =>
                        handleChange(p.id, "price", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-24"
                    />
                  ) : (
                    `Rs ${p.price}`
                  )}
                </td>
                <td className="p-3">
                  {editingId === p.id ? (
                    <input
                      type="number"
                      value={formState[p.id]?.urgentPrice || ""}
                      onChange={(e) =>
                        handleChange(p.id, "urgentPrice", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-24"
                    />
                  ) : (
                    `Rs ${p.urgentPrice ?? "-"}`
                  )}
                </td>
                <td className="p-3">
                  {editingId === p.id ? (
                    <button
                      onClick={() => handleSave(p.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleEdit(p.id, p.price, p.urgentPrice)
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-3 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductTableClient;
