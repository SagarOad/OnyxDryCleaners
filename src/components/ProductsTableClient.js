"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "./Pagination";

export default function ProductsTableClient() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editKind, setEditKind] = useState(null);
  const [formState, setFormState] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const pageSize = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setSaveError(null);
      const res = await axios.get("/api/products-list", {
        params: { page: currentPage, pageSize, searchQuery },
      });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery]);

  const openEdit = (product, kind) => {
    setEditingId(product.id);
    setEditKind(kind);
    setSaveError(null);
    setFormState((prev) => ({
      ...prev,
      [product.id]: {
        label: product.label,
        price: product.price,
        urgentPrice:
          product.urgentPrice === 0 || product.urgentPrice == null
            ? ""
            : String(product.urgentPrice),
      },
    }));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditKind(null);
    setSaveError(null);
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

  const handleSave = async (product) => {
    const id = product.id;
    const row = formState[id];
    if (!row) return;

    const label =
      editKind === "prices" ? product.label : (row.label ?? "").trim();
    if (!label) {
      setSaveError("Product name cannot be empty.");
      return;
    }

    const parsedPrice = parseFloat(row.price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setSaveError("Enter a valid standard price (0 or greater).");
      return;
    }

    const urgentRaw = row.urgentPrice;
    let parsedUrgentPrice = 0;
    if (urgentRaw !== "" && urgentRaw != null) {
      const u = parseFloat(urgentRaw);
      if (Number.isNaN(u) || u < 0) {
        setSaveError("Enter a valid urgent price or leave it blank for 0.");
        return;
      }
      parsedUrgentPrice = u;
    }

    try {
      setSaveError(null);
      await axios.put("/api/update-product-price", {
        id,
        label,
        price: parsedPrice,
        urgentPrice: parsedUrgentPrice,
      });
      cancelEdit();
      fetchProducts();
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError(
        err.response?.data?.error ||
          "Could not save changes. Please try again."
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete("/api/delete-product", { data: { id } });
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search products..."
          className="w-full sm:max-w-md px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
        />
      </div>

      {saveError && (
        <div
          className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {saveError}
        </div>
      )}

      <div className="touch-pan-x overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="py-3 px-3 font-medium whitespace-nowrap">S.No</th>
              <th className="py-3 px-3 font-medium">Label</th>
              <th className="py-3 px-3 font-medium whitespace-nowrap">Code</th>
              <th className="py-3 px-3 font-medium whitespace-nowrap">
                Standard price
              </th>
              <th className="py-3 px-3 font-medium whitespace-nowrap">
                Urgent price
              </th>
              <th className="py-3 px-3 font-medium text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td colSpan={6} className="p-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : products.length > 0 ? (
              products.map((p, index) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 odd:bg-slate-50/80"
                >
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-3 px-3 text-slate-800">
                    {editingId === p.id && editKind === "full" ? (
                      <input
                        type="text"
                        value={formState[p.id]?.label ?? ""}
                        onChange={(e) =>
                          handleChange(p.id, "label", e.target.value)
                        }
                        className="w-full min-w-[8rem] max-w-xs border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                      />
                    ) : (
                      <span className="font-medium">{p.label}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                    {p.value}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formState[p.id]?.price ?? ""}
                        onChange={(e) =>
                          handleChange(p.id, "price", e.target.value)
                        }
                        className="w-28 border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                      />
                    ) : (
                      <span className="text-slate-800">Rs {p.price}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0"
                        value={formState[p.id]?.urgentPrice ?? ""}
                        onChange={(e) =>
                          handleChange(p.id, "urgentPrice", e.target.value)
                        }
                        className="w-28 border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                      />
                    ) : (
                      <span className="text-slate-800">
                        {p.urgentPrice != null && p.urgentPrice > 0
                          ? `Rs ${p.urgentPrice}`
                          : "—"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {editingId === p.id ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSave(p)}
                          className="inline-flex rounded-md bg-emerald-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex rounded-md border border-slate-300 bg-white text-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          title="Change standard and urgent rates only"
                          onClick={() => openEdit(p, "prices")}
                          className="inline-flex rounded-md bg-slate-800 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-700"
                        >
                          Edit rates
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(p, "full")}
                          className="inline-flex rounded-md border border-slate-300 bg-white text-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="inline-flex rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      )}
    </div>
  );
}
