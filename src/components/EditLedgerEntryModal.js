"use client";

import { useState, useEffect } from "react";

export default function EditLedgerEntryModal({ entry, onClose, onSaved }) {
  const [form, setForm] = useState({
    service: "",
    subtotal: "",
    deliveryCharge: "",
    discount: "",
    outsourcingCost: "",
    profit: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!entry) return;
    setForm({
      service: entry.service ?? "",
      subtotal: entry.subtotal ?? "",
      deliveryCharge: entry.deliveryCharge ?? "",
      discount: entry.discount ?? "",
      outsourcingCost: entry.outsourcingCost ?? "",
      profit: entry.profit ?? "",
    });
    setError(null);
  }, [entry]);

  if (!entry) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/update-order-financials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          service: form.service,
          subtotal: form.subtotal === "" ? undefined : form.subtotal,
          deliveryCharge:
            form.deliveryCharge === "" ? undefined : form.deliveryCharge,
          discount: form.discount === "" ? undefined : form.discount,
          outsourcingCost:
            form.outsourcingCost === "" ? undefined : form.outsourcingCost,
          profit: form.profit === "" ? null : form.profit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved(data.order);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Edit ledger entry
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Order ID · {entry.id.slice(0, 8)}… · {entry.customerName}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Service
            </label>
            <input
              name="service"
              value={form.service}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Subtotal
              </label>
              <input
                name="subtotal"
                type="number"
                step="0.01"
                value={form.subtotal}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Delivery
              </label>
              <input
                name="deliveryCharge"
                type="number"
                step="0.01"
                value={form.deliveryCharge}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Discount
              </label>
              <input
                name="discount"
                type="number"
                step="0.01"
                value={form.discount}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Outsourcing cost
              </label>
              <input
                name="outsourcingCost"
                type="number"
                step="0.01"
                value={form.outsourcingCost}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Profit (optional)
            </label>
            <input
              name="profit"
              type="number"
              step="0.01"
              value={form.profit}
              onChange={handleChange}
              placeholder="Leave blank to clear"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
