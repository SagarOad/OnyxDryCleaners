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

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormState((prev) => ({
      ...prev,
      [product.id]: {
        label: product.label,
        price: product.price,
        urgentPrice: product.urgentPrice ?? "",
      },
    }));
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
    const { label, price, urgentPrice } = formState[id];
    const parsedPrice = parseFloat(price);
    const parsedUrgentPrice = parseFloat(urgentPrice);

    if (!isNaN(parsedPrice) && !isNaN(parsedUrgentPrice)) {
      try {
        await axios.put("/api/update-product-price", {
          id,
          label,
          price: parsedPrice,
          urgentPrice: parsedUrgentPrice,
        });
        setEditingId(null);
        fetchProducts();
      } catch (err) {
        console.error("Save failed:", err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete("/api/delete-product", { data: { id } });
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error("Delete failed:", err);
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
            <th className="p-3 text-left">S.No</th> {/* New column */}
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
                <td className="p-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </td>
                {/* existing skeleton columns */}
              </tr>
            ))
          ) : products.length > 0 ? (
            products.map((p, index) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="p-3">
                  {editingId === p.id ? (
                    <input
                      type="text"
                      value={formState[p.id]?.label || ""}
                      onChange={(e) =>
                        handleChange(p.id, "label", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    p.label
                  )}
                </td>
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
                <td className="p-3 space-x-2">
                  {editingId === p.id ? (
                    <button
                      onClick={() => handleSave(p.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-3 text-center text-gray-500">
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
