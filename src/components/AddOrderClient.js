"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Select from "react-select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import ReceiptClient from "./ReceiptClient";
import { getReceiptNumber } from "@/lib/receiptNumber";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30";
const RECEIPT_COUNTER_START = 6511;
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#64748b" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(148, 163, 184, 0.35)" : "none",
    minHeight: "46px",
    "&:hover": { borderColor: "#94a3b8" },
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
};

function buildOrderErrors(order, pickFromDirectory) {
  const errors = {};
  if (pickFromDirectory) {
    if (order.existingCustomerId == null) {
      errors.customer = "Select a customer from the directory.";
    }
  } else if (!String(order.customer ?? "").trim()) {
    errors.customer = "Customer name is required.";
  }
  if (!String(order.contact ?? "").trim()) {
    errors.contact = "Contact is required.";
  }
  if (!String(order.service ?? "").trim()) {
    errors.service = "Service is required.";
  }
  if (!order.items?.length) {
    errors.items = "Select at least one product.";
  }
  if (!String(order.outsourcingCompanyName ?? "").trim()) {
    errors.outsourcingCompanyName = "Outsourcing company is required.";
  }
  const oc = Number(order.outsourcingCost);
  if (!Number.isFinite(oc) || oc < 0) {
    errors.outsourcingCost = "Enter a valid cost (0 or more).";
  }
  const del = Number(order.charges.deliveryCharge);
  if (!Number.isFinite(del) || del < 0) {
    errors.deliveryCharge = "Enter a valid delivery charge (0 or more).";
  }
  const disc = Number(order.charges.discount);
  if (!Number.isFinite(disc) || disc < 0) {
    errors.discount = "Enter a valid discount (0 or more).";
  }
  return errors;
}

const ERROR_SCROLL_ORDER = [
  "customer",
  "contact",
  "service",
  "items",
  "outsourcingCompanyName",
  "outsourcingCost",
  "deliveryCharge",
  "discount",
];

function scrollToFirstOrderError(errs) {
  for (const key of ERROR_SCROLL_ORDER) {
    if (errs[key]) {
      document.getElementById(`ao-field-${key}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      break;
    }
  }
}

export default function AddOrderClient({ initialData }) {
  const [order, setOrder] = useState({
    customer: initialData?.customer?.name || "",
    contact: initialData?.customer?.contact || "",
    email: initialData?.customer?.email || "",
    address: "",
    service: initialData?.service || "",
    items: [],
    isUrgent: false,
    charges: {
      deliveryCharge: initialData?.deliveryCharge || 0,
      discount: initialData?.discount || 0,
    },
    outsourcingCompanyName: initialData?.outsourcingCompany?.name || "",
    outsourcingCost: initialData?.outsourcingCost || 0,
    existingCustomerId: initialData?.customer?.id || null,
    deliveryDate: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(RECEIPT_COUNTER_START);
  const [isEditing, setIsEditing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false); // Track mount state
  const [receiptData, setReceiptData] = useState(null);
  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState([]);
  const [existingCustomerOptions, setExistingCustomerOptions] = useState([]);
  const [pickFromDirectory, setPickFromDirectory] = useState(
    Boolean(initialData?.customer?.id)
  );
  const [deliveryDate, setDeliveryDate] = useState("");
  
  // Fetch existing customers
  useEffect(() => {
    const fetchExistingCustomers = async () => {
      try {
        const response = await axios.get("/api/get-existing-customer");
        const customers = response.data.existingCustomers.map((customer) => ({
          value: customer.id,
          label: customer.name,
          contact: customer.contact,
          email: customer.email,
          address: customer.address,
        }));
        setExistingCustomerOptions(customers);
      } catch (error) {
        console.error("Error fetching existing customers:", error);
      }
    };
    fetchExistingCustomers();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/get-products");
        const productOptions = response.data.map((product) => ({
          value: product.id,
          label: product.label,
          price: product.price,
          urgentPrice: product.urgentPrice,
        }));
        setOptions(productOptions);
      } catch (error) {
        console.error("Error fetching product options:", error);
      }
    };
    fetchProducts();
  }, []);

  // Handle product selection
  const handleProductChange = (selectedOptions) => {
    const opts = selectedOptions ?? [];
    const updatedItems = opts.map((option) => {
      const existingItem = order.items.find(
        (item) => item.product === option.label
      );
      const isUrgent = existingItem?.urgent ?? false;
      const quantity = existingItem?.quantity ?? 1;

      const unitPrice =
        isUrgent && option.urgentPrice != null
          ? option.urgentPrice
          : option.price;

      return {
        product: option.label,
        quantity,
        urgent: isUrgent,
        unitPrice,
        amount: unitPrice * quantity,
      };
    });

    setOrder((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleUrgentChange = (index, isUrgent) => {
    const updatedItems = [...order.items];
    const item = updatedItems[index];
    const option = options.find((opt) => opt.label === item.product);

    const unitPrice =
      isUrgent && option?.urgentPrice != null
        ? option.urgentPrice
        : option?.price ?? item.unitPrice;

    updatedItems[index] = {
      ...item,
      urgent: isUrgent,
      unitPrice,
      amount: unitPrice * item.quantity,
    };

    setOrder((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  useEffect(() => {
    if (order.items.length === 0) return;

    const updatedItems = order.items.map((item) => {
      const matchingOption = options.find((opt) => opt.label === item.product);
      if (!matchingOption) return item;

      const isUrgent = item.urgent;
      const newUnitPrice =
        isUrgent && matchingOption.urgentPrice != null
          ? matchingOption.urgentPrice
          : matchingOption.price;

      return {
        ...item,
        unitPrice: newUnitPrice,
        amount: newUnitPrice * item.quantity,
      };
    });

    setOrder((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  }, [options]); // only trigger when `options` change

  const handleCustomerChange = (selectedOption) => {
    if (!selectedOption) {
      setOrder((prev) => ({
        ...prev,
        customer: "",
        contact: "",
        email: "",
        address: "",
        existingCustomerId: null,
      }));
      return;
    }
    setOrder((prev) => ({
      ...prev,
      customer: selectedOption.label,
      contact: selectedOption.contact || "",
      email: selectedOption.email || "",
      address: selectedOption.address || "",
      existingCustomerId: selectedOption.value,
    }));
  };

  // Handle quantity change for a specific product
  const handleQuantityChange = (index, rawQty) => {
    const q = Math.max(1, parseInt(String(rawQty), 10) || 1);
    const updatedItems = [...order.items];
    updatedItems[index].quantity = q;
    updatedItems[index].amount = q * updatedItems[index].unitPrice;

    setOrder({ ...order, items: updatedItems });
  };

  const clearError = useCallback((key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const isFormValid = useMemo(
    () => Object.keys(buildOrderErrors(order, pickFromDirectory)).length === 0,
    [order, pickFromDirectory]
  );

  const validateForm = () => {
    const newErrors = buildOrderErrors(order, pickFromDirectory);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstOrderError(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  // Wait until the component has mounted before accessing localStorage
  useEffect(() => {
    setHasMounted(true);
    const savedOrderCount = Number(localStorage.getItem("orderCount"));
    const nextCount =
      Number.isFinite(savedOrderCount) && savedOrderCount > 0
        ? Math.max(savedOrderCount, RECEIPT_COUNTER_START)
        : RECEIPT_COUNTER_START;
    setOrderCount(nextCount);
  }, []);

  // Update localStorage whenever orderCount changes (after mount)
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("orderCount", orderCount);
    }
  }, [orderCount, hasMounted]);

  const handleSaveNewOrderCount = (newCount) => {
    setOrderCount(newCount);
    localStorage.setItem("orderCount", newCount);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const existingCustomerId = pickFromDirectory
        ? order.existingCustomerId
        : null;

      const response = await axios.post("/api/add-order", {
        customerName: order.customer.trim(),
        customerContact: order.contact.trim(),
        customerEmail: order.email,
        customerAddress: order.address,
        service: order.service.trim(),
        items: order.items,
        isUrgent: order.isUrgent,
        charges: {
          deliveryCharge: Number(order.charges.deliveryCharge) || 0,
          discount: Number(order.charges.discount) || 0,
        },
        status: "received",
        outsourcingCompanyName: order.outsourcingCompanyName.trim(),
        outsourcingCost: Number(order.outsourcingCost) || 0,
        existingCustomerId:
          existingCustomerId === undefined ? null : existingCustomerId,
      });

      // Show the receipt (preserve urgent flags for receipt rendering)
      setReceiptData({
        ...response.data,
        items: order.items,
        isUrgent: order.isUrgent,
        deliveryDate,
        localReceiptNo: `00${orderCount}`,
      });
      setShowModal(true);

      // **Increment the order count**
      setOrderCount((prevCount) => prevCount + 1);

      // **Reset the form fields**
      setOrder({
        customer: "",
        contact: "",
        email: "",
        address: "",
        service: "",
        items: [],
        isUrgent: false,
        charges: {
          deliveryCharge: 0,
          discount: 0,
        },
        outsourcingCompanyName: "",
        outsourcingCost: 0,
        existingCustomerId: null,
      });
      setPickFromDirectory(false);
      setDeliveryDate("");
      setErrors({});
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted) {
    return (
      <div className="grid min-h-[320px] grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-6">
          <div className="animate-pulse space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-8 w-1/3 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-6">
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = order.items.reduce((acc, item) => acc + item.amount, 0);
  const deliveryCharge = parseFloat(order.charges.deliveryCharge) || 0;
  // const discountPercentage = parseFloat(order.charges.discount) || 0;
  const discountAmount = parseFloat(order.charges.discount) || 0;
  const totalAmount = (subtotal - discountAmount + deliveryCharge).toFixed(2);

  return (
    <>
      {loading && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-10 py-8 shadow-xl">
            <Loader2 className="h-12 w-12 animate-spin text-slate-700" />
            <p className="text-sm font-semibold text-slate-800">
              Creating order…
            </p>
            <p className="text-xs text-slate-500">Please wait</p>
          </div>
        </div>
      )}

      <div className="relative grid min-w-0 w-full grid-cols-12 gap-4 xl:gap-6">
        <div className="col-span-12 min-w-0 xl:col-span-6">
          <div className="flex justify-start">
            <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 xl:mr-4">
              <h2 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">
                New order
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                Customer, line items, and charges feed the ledger automatically.
              </p>

              {/* Customer & service */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                  id="ao-field-customer"
                  className="md:col-span-2 rounded-lg border border-slate-100 bg-slate-50/50 p-4"
                >
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Customer source
                  </label>
                  <div
                    className="mb-3 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
                    role="group"
                    aria-label="Customer source"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setPickFromDirectory(false);
                        setOrder((prev) => ({
                          ...prev,
                          existingCustomerId: null,
                        }));
                        clearError("customer");
                      }}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        !pickFromDirectory
                          ? "bg-slate-800 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Walk-in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPickFromDirectory(true);
                        setOrder((prev) => ({
                          ...prev,
                          customer: "",
                          contact: "",
                          email: "",
                          address: "",
                          existingCustomerId: null,
                        }));
                        clearError("customer");
                      }}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        pickFromDirectory
                          ? "bg-slate-800 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      From directory
                    </button>
                  </div>

                  {pickFromDirectory ? (
                    <>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Existing customer <span className="text-red-600">*</span>
                      </label>
                      <Select
                        options={existingCustomerOptions}
                        onChange={(opt) => {
                          handleCustomerChange(opt);
                          clearError("customer");
                        }}
                        value={
                          existingCustomerOptions.find(
                            (o) => o.value === order.existingCustomerId
                          ) || null
                        }
                        placeholder="Search or select…"
                        isClearable
                        styles={selectStyles}
                        className={`text-slate-900 ${
                          errors.customer
                            ? "rounded-lg ring-2 ring-red-200"
                            : ""
                        }`}
                      />
                    </>
                  ) : (
                    <>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Customer name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={order.customer}
                        onChange={(e) => {
                          setOrder({
                            ...order,
                            customer: e.target.value,
                            existingCustomerId: null,
                          });
                          clearError("customer");
                        }}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.customer)}
                        placeholder="e.g. Ali Khan"
                        className={`${inputClass} ${
                          errors.customer ? "border-red-500" : ""
                        }`}
                      />
                    </>
                  )}
                  {errors.customer && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.customer}
                    </p>
                  )}
                </div>

                <div id="ao-field-contact">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Contact <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={order.contact}
                    onChange={(e) => {
                      setOrder({ ...order, contact: e.target.value });
                      clearError("contact");
                    }}
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.contact)}
                    placeholder="Phone or mobile"
                    className={`${inputClass} ${
                      errors.contact ? "border-red-500" : ""
                    }`}
                  />
                  {errors.contact && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={order.address}
                    onChange={(e) =>
                      setOrder({ ...order, address: e.target.value })
                    }
                    autoComplete="street-address"
                    className={inputClass}
                  />
                </div>

                <div id="ao-field-service" className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Service <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={order.service}
                    onChange={(e) => {
                      setOrder({ ...order, service: e.target.value });
                      clearError("service");
                    }}
                    aria-invalid={Boolean(errors.service)}
                    placeholder="e.g. Wash & fold, dry clean"
                    className={`${inputClass} ${
                      errors.service ? "border-red-500" : ""
                    }`}
                  />
                  {errors.service && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.service}
                    </p>
                  )}
                </div>
              </div>

              {/* Items (Products Multi-select) */}
              <div className="mb-6" id="ao-field-items">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Line items <span className="text-red-600">*</span>
                </h3>
                <Select
                  isMulti
                  options={options}
                  onChange={(sel) => {
                    handleProductChange(sel);
                    clearError("items");
                  }}
                  styles={selectStyles}
                  className={`text-slate-900 ${
                    errors.items ? "rounded-lg ring-2 ring-red-200" : ""
                  }`}
                  placeholder="Select one or more products"
                />
                {errors.items && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.items}
                  </p>
                )}
              </div>

              {/* Delivery Date */}
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate || ""}
                  onChange={(e) =>
                    setDeliveryDate(e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              {/* Charges */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div id="ao-field-deliveryCharge">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Delivery charge (Rs)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={order.charges.deliveryCharge}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      setOrder({
                        ...order,
                        charges: {
                          ...order.charges,
                          deliveryCharge: Number.isFinite(v) ? v : 0,
                        },
                      });
                      clearError("deliveryCharge");
                    }}
                    className={`${inputClass} ${
                      errors.deliveryCharge ? "border-red-500" : ""
                    }`}
                  />
                  {errors.deliveryCharge && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.deliveryCharge}
                    </p>
                  )}
                </div>

                <div id="ao-field-discount">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Discount (Rs)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={order.charges.discount}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      setOrder({
                        ...order,
                        charges: {
                          ...order.charges,
                          discount: Number.isFinite(v) ? v : 0,
                        },
                      });
                      clearError("discount");
                    }}
                    className={`${inputClass} ${
                      errors.discount ? "border-red-500" : ""
                    }`}
                  />
                  {errors.discount && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.discount}
                    </p>
                  )}
                </div>
              </div>

              {/* Outsourcing */}
              <div className="mb-6 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <div id="ao-field-outsourcingCompanyName">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Outsourcing company <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={order.outsourcingCompanyName}
                    onChange={(e) => {
                      setOrder({
                        ...order,
                        outsourcingCompanyName: e.target.value,
                      });
                      clearError("outsourcingCompanyName");
                    }}
                    aria-invalid={Boolean(errors.outsourcingCompanyName)}
                    placeholder="Vendor or workshop name"
                    className={`${inputClass} ${
                      errors.outsourcingCompanyName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.outsourcingCompanyName && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.outsourcingCompanyName}
                    </p>
                  )}
                </div>

                <div id="ao-field-outsourcingCost" className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Outsourcing cost (Rs)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={order.outsourcingCost}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      setOrder({
                        ...order,
                        outsourcingCost: Number.isFinite(v) ? v : 0,
                      });
                      clearError("outsourcingCost");
                    }}
                    className={`${inputClass} ${
                      errors.outsourcingCost ? "border-red-500" : ""
                    }`}
                  />
                  {errors.outsourcingCost && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.outsourcingCost}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary Section */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">
                  Summary
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-700">
                  <p>
                    Urgent:{" "}
                    <span className="font-medium text-slate-900">
                      {order.isUrgent ? "Yes" : "No"}
                    </span>
                  </p>
                  <p>Subtotal: Rs {subtotal.toFixed(2)}</p>
                  <p>Delivery: Rs {deliveryCharge.toFixed(2)}</p>
                  <p>Discount: Rs {discountAmount.toFixed(2)}</p>
                  <p className="border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                    Total: Rs {totalAmount}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                {isEditing ? (
                  <input
                    type="number"
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    defaultValue={orderCount}
                    onBlur={(e) =>
                      handleSaveNewOrderCount(Number(e.target.value))
                    }
                  />
                ) : (
                  <span className="text-sm text-slate-600">
                    Receipt no.{" "}
                    <strong className="text-slate-900">00{orderCount}</strong>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid}
                  title={
                    !isFormValid
                      ? "Fill all required fields to submit"
                      : undefined
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 min-w-0 xl:col-span-6">
          <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <h3 className="mb-1 text-lg font-semibold text-slate-900 md:text-xl">
              Selected products
            </h3>
            <p className="mb-4 text-sm text-slate-600 md:mb-6">
              Quantities and urgent flags apply per line.
            </p>

            {order.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
                <svg
                  className="mb-3 h-12 w-12 text-slate-400 md:mb-4 md:h-16 md:w-16"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6h18M3 12h18M3 18h18"
                  />
                </svg>
                <p className="text-base font-medium text-slate-600 md:text-lg">
                  No products selected yet.
                </p>
                <p className="mt-1 text-sm text-slate-500 md:mt-2 md:text-base">
                  Use the line items field in the order form to add products.
                </p>
              </div>
            ) : (
              order.items.map((item, index) => (
                <div
                  key={index}
                  className={`mb-4 rounded-lg border p-3 md:mb-6 md:p-4 ${
                    item.urgent
                      ? "border-rose-200 bg-rose-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-3 flex flex-col justify-between md:mb-4 md:flex-row md:items-center">
                    <h4
                      className={`text-base font-semibold md:text-lg ${
                        item.urgent ? "text-rose-800" : "text-slate-900"
                      }`}
                    >
                      {item.product}
                    </h4>

                    <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor={`quantity-${index}`}
                          className="text-slate-700 text-sm font-medium md:text-base"
                        >
                          Quantity:
                        </label>
                        <input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              index,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-16 rounded-md border border-slate-300 p-1 focus:border-slate-500 focus:outline-none md:w-24 md:p-2"
                        />
                      </div>

                      {options.find((opt) => opt.label === item.product)
                        ?.urgentPrice != null && (
                        <div className="flex items-center space-x-2">
                          <label
                            htmlFor={`urgent-${index}`}
                            className="text-sm font-medium text-rose-800 md:text-base"
                          >
                            Urgent:
                          </label>
                          <select
                            id={`urgent-${index}`}
                            value={item.urgent ? "yes" : "no"}
                            onChange={(e) =>
                              handleUrgentChange(
                                index,
                                e.target.value === "yes"
                              )
                            }
                            className="rounded-md border border-slate-300 p-1 focus:border-rose-500 focus:outline-none md:p-2"
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 md:text-base">
                    <span className="font-semibold">Price:</span> Rs{" "}
                    {item.unitPrice.toFixed(2)}{" "}
                    {item.urgent && (
                      <span className="font-semibold text-rose-600">
                        (Urgent)
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-slate-700 md:text-base">
                    <span className="font-semibold">Amount:</span> Rs{" "}
                    {item.amount.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Receipt Modal */}
      {showModal && (
        <ReceiptClient
          data={receiptData}
          deliveryDate={deliveryDate}
          orderCount={orderCount} // Now it starts from 1020 and increments
          receiptNumber={receiptData?.localReceiptNo}
          issuedAt={receiptData?.createdAt}
          onClose={() => setShowModal(false)}
          totalAmount={totalAmount}
        />
      )}
    </>
  );
}
