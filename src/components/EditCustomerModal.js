"use client";

import React, { useMemo, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30";

const EditCustomerModal = ({ customer, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ ...customer });

  const nameOk = String(formData.name ?? "").trim().length > 0;
  const canSave = nameOk;

  const nameError = useMemo(
    () => (nameOk ? "" : "Name is required."),
    [nameOk]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSubmit({
      ...formData,
      name: String(formData.name).trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-customer-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2
          id="edit-customer-title"
          className="mb-1 text-lg font-semibold text-slate-900"
        >
          Edit customer
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Update directory details. Name cannot be empty.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Customer name"
              aria-invalid={!nameOk}
              className={`${inputClass} ${!nameOk ? "border-red-500" : ""}`}
            />
            {!nameOk ? (
              <p className="mt-1 text-xs font-medium text-red-600">{nameError}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Contact
            </label>
            <input
              name="contact"
              value={formData.contact ?? ""}
              onChange={handleChange}
              placeholder="Phone"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              name="address"
              value={formData.address ?? ""}
              onChange={handleChange}
              placeholder="Address"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Service
            </label>
            <input
              name="service"
              value={formData.service ?? ""}
              onChange={handleChange}
              placeholder="Service note"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              title={!canSave ? "Enter a customer name" : undefined}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;
