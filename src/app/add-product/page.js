"use client";
import AdminShell from "@/components/AdminShell";
import { useState, useMemo } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export default function AdminProducts() {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [urgentPrice, setUrgentPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const p = parseFloat(price);
    const u = parseFloat(urgentPrice);
    return (
      name.trim().length > 0 &&
      value.trim().length > 0 &&
      Number.isFinite(p) &&
      p >= 0 &&
      Number.isFinite(u) &&
      u >= 0
    );
  }, [name, value, price, urgentPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError("Fill all fields with valid numbers (0 or more).");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post("/api/add-product", {
        name: name.trim(),
        value: value.trim(),
        price,
        urgentPrice,
      });

      setSuccess("Product added successfully.");
      setName("");
      setValue("");
      setPrice("");
      setUrgentPrice("");
    } catch (err) {
      setError("Failed to add product. Check values and try again.");
      console.error("Error:", err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Add product">
      <div className="relative max-w-xl">
        {submitting && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px]"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              Saving product…
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${submitting ? "pointer-events-none opacity-90" : ""}`}
        >
          <p className="mb-6 text-sm text-slate-600">
            Add a catalog item with standard and urgent pricing. Codes must stay
            unique.
          </p>

          <div className="mb-4">
            <label className={labelClass}>
              Product name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              Internal code / value <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>
              Standard price (Rs) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
              min={0}
              step="0.01"
            />
          </div>

          <div className="mb-6">
            <label className={labelClass}>
              Urgent price (Rs) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={urgentPrice}
              onChange={(e) => setUrgentPrice(e.target.value)}
              className={inputClass}
              min={0}
              step="0.01"
            />
          </div>

          {error && (
            <p
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 animate-in fade-in duration-300"
              role="status"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            title={!canSubmit ? "Complete all required fields" : undefined}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              "Add product"
            )}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
