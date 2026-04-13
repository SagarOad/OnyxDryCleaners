"use client";
import AdminShell from "@/components/AdminShell";
import { useState, useMemo } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export default function AddExistingCustomer() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [service, setService] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("/api/add-existing-customer", {
        name: name.trim(),
        contact: contact.trim() || null,
        address: address.trim() || null,
        service: service.trim() || null,
      });

      setSuccess("Customer added to your directory.");
      setName("");
      setContact("");
      setAddress("");
      setService("");
    } catch (err) {
      setError("Failed to add customer. The name may already exist.");
      console.error("Error:", err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Add customer">
      <div className="relative max-w-xl">
        {submitting && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px]"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              Saving customer…
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${submitting ? "pointer-events-none opacity-90" : ""}`}
        >
          <p className="mb-6 text-sm text-slate-600">
            Adds a row to the existing-customer list used when creating orders.
          </p>

          <div className="mb-4">
            <label className={labelClass}>
              Customer name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Contact (optional)</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Address (optional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label className={labelClass}>Service note (optional)</label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={inputClass}
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
              className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              role="status"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            title={!canSubmit ? "Enter a customer name" : undefined}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              "Add customer"
            )}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
