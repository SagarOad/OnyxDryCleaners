"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import ReceiptClient from "./ReceiptClient";

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
  const [orderCount, setOrderCount] = useState(1020);
  const [isEditing, setIsEditing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false); // Track mount state
  const [receiptData, setReceiptData] = useState(null);
  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState([]);
  const [existingCustomerOptions, setExistingCustomerOptions] = useState([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false); // Toggle for new/existing customer
  const [deliveryDate, setDeliveryDate] = useState("");
  
  // Fetch existing customers
  useEffect(() => {
    const fetchExistingCustomers = async () => {
      try {
        const response = await axios.get("/api/get-existing-customer");
        const customers = response.data.existingCustomers.map((customer) => ({
          id: customer.id,
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
    const updatedItems = selectedOptions.map((option) => {
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

  // Handle customer selection
  const handleCustomerChange = (selectedOption) => {
    setOrder((prev) => ({
      ...prev,
      customer: selectedOption.label,
      contact: selectedOption.contact || "",
      email: selectedOption.email || "",
      address: selectedOption.address || "",
      existingCustomerId: selectedOption.id,
    }));
  };

  // Handle quantity change for a specific product
  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...order.items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].amount = newQuantity * updatedItems[index].unitPrice;

    setOrder({ ...order, items: updatedItems });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!order.customer) newErrors.customer = "Customer Name is required";
    if (!order.contact) newErrors.contact = "Contact is required";
    // if (!order.email) newErrors.email = "Email is required";
    if (!order.service) newErrors.service = "Service is required";
    if (!order.items.length)
      newErrors.items = "At least one product must be selected";
    if (!order.outsourcingCompanyName)
      newErrors.outsourcingCompanyName = "Outsourcing Company is required";
    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Wait until the component has mounted before accessing localStorage
  useEffect(() => {
    setHasMounted(true);
    const savedOrderCount = Number(localStorage.getItem("orderCount")) || 1020;
    setOrderCount(savedOrderCount);
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
    console.log("Button clicked. Current loading state:", loading);

    if (!validateForm()) return;
    setLoading(true);

    try {
      console.log("Submitting order with service:", order.service);

      const response = await axios.post("/api/add-order", {
        customerName: order.customer,
        customerContact: order.contact,
        customerEmail: order.email,
        customerAddress: order.address,
        service: order.service,
        items: order.items,
        isUrgent: order.isUrgent,
        charges: {
          deliveryCharge: parseFloat(order.charges.deliveryCharge) || 0,
          discount: parseFloat(order.charges.discount) || 0,
        },
        status: "received",
        outsourcingCompanyName: order.outsourcingCompanyName,
        outsourcingCost: parseFloat(order.outsourcingCost) || 0,
        existingCustomerId: order.existingCustomerId || null,
      });

      // Show the receipt
      setReceiptData(response.data);
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
        charges: {
          deliveryCharge: 0,
          discount: 0,
        },
        outsourcingCompanyName: "",
        outsourcingCost: 0,
        existingCustomerId: null,
      });
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  // Avoid mismatched SSR vs. Client content
  if (!hasMounted) {
    return null; // Prevent rendering until localStorage is available
  }

  // Calculate totals
  const subtotal = order.items.reduce((acc, item) => acc + item.amount, 0);
  const deliveryCharge = parseFloat(order.charges.deliveryCharge) || 0;
  // const discountPercentage = parseFloat(order.charges.discount) || 0;
  const discountAmount = parseFloat(order.charges.discount) || 0;
  const totalAmount = (subtotal - discountAmount + deliveryCharge).toFixed(2);

  return (
    <>
      <div className=" grid grid-cols-12">
        <div className="col-span-12 md:col-span-6">
          <div className="flex justify-left">
            <div className="container p-6 mr-4 bg-white rounded-lg shadow-lg max-w-4xl">
              <h2 className="text-2xl font-semibold mb-6 text-blue-800">
                New Order
              </h2>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={order.customer}
                    onChange={(e) =>
                      setOrder({ ...order, customer: e.target.value })
                    }
                    className={`p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.customer ? "border-red-500" : "border-gray-300"
                    }`}
                  />

                  <div className="mt-4">
                    <label className="block text-blue-700 font-medium mb-1">
                      Is this a new customer?
                    </label>
                    <input
                      type="checkbox"
                      checked={isNewCustomer}
                      onChange={() => {
                        setIsNewCustomer(!isNewCustomer);
                        if (!isNewCustomer) {
                          // When checking the box, reset the existing customer ID
                          setOrder((prevOrder) => ({
                            ...prevOrder,
                            existingCustomerId: null, // Clear existing customer ID
                          }));
                        }
                      }}
                    />
                  </div>

                  {isNewCustomer ? (
                    <div className="mt-4">
                      <label className="block text-blue-700 font-medium mb-1">
                        Existing Customers
                      </label>
                      <Select
                        options={existingCustomerOptions}
                        onChange={handleCustomerChange}
                        placeholder="Select customer"
                        className={`mb-4 text-black ${
                          errors.customer ? "border-red-500" : ""
                        }`}
                      />
                      {errors.customer && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.customer}
                        </p>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={order.customer}
                      onChange={(e) =>
                        setOrder({ ...order, customer: e.target.value })
                      }
                      placeholder="Enter new customer name"
                    />
                  )}

                  {/* Other form fields go here, like contact, email, address, service, etc. */}
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={order.contact}
                    onChange={(e) =>
                      setOrder({ ...order, contact: e.target.value })
                    }
                    className={`p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.contact ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={order.address}
                    onChange={(e) =>
                      setOrder({ ...order, address: e.target.value })
                    }
                    className={`p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Service
                  </label>
                  <input
                    type="text"
                    value={order.service}
                    onChange={(e) =>
                      setOrder({ ...order, service: e.target.value })
                    }
                    className={`p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.service ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.service && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.service}
                    </p>
                  )}
                </div>
              </div>

              {/* Items (Products Multi-select) */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">
                  Add Items
                </h3>
                <Select
                  isMulti
                  options={options}
                  onChange={handleProductChange}
                  className="mb-4 text-black"
                  placeholder="Select products"
                />
                {errors.items && (
                  <p className="text-red-500 text-xs mt-1">{errors.items}</p>
                )}
              </div>

              {/* Delivery Date */}
              <div className="mb-6">
                <label className="block text-blue-700 font-medium mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate || ""}
                  onChange={(e) =>
                    setDeliveryDate(e.target.value)
                  }
                  className="p-3 w-full border rounded-md"
                />
              </div>

              {/* Charges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Delivery Charge
                  </label>
                  <input
                    type="number"
                    value={order.charges.deliveryCharge}
                    onChange={(e) =>
                      setOrder({
                        ...order,
                        charges: {
                          ...order.charges,
                          deliveryCharge: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="p-3 w-full border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Discount
                  </label>
                  <input
                    type="number"
                    value={order.charges.discount}
                    onChange={(e) =>
                      setOrder({
                        ...order,
                        charges: {
                          ...order.charges,
                          discount: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="p-3 w-full border rounded-md"
                  />
                </div>
              </div>

              {/* Outsourcing Details */}
              <div className="mb-6">
                <label className="block text-blue-700 font-medium mb-1">
                  Outsourcing Company Name
                </label>
                <input
                  type="text"
                  value={order.outsourcingCompanyName}
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      outsourcingCompanyName: e.target.value,
                    })
                  }
                  className={`p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors.outsourcingCompanyName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                <label className="block text-blue-700 font-medium mt-4 mb-1">
                  Outsourcing Cost
                </label>
                <input
                  type="number"
                  value={order.outsourcingCost}
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      outsourcingCost: parseFloat(e.target.value),
                    })
                  }
                  className="p-3 w-full border rounded-md"
                />
              </div>

              {/* Summary Section */}
              <div className="container p-6 mt-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">
                  Summary
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <p>Urgent Order: {order.isUrgent ? "Yes" : "No"}</p>
                  <p>Subtotal: {subtotal.toFixed(2)}</p>
                  <p>Delivery Charge: {deliveryCharge.toFixed(2)}</p>
                  <p>Discount: {discountAmount.toFixed(2)}</p>
                  <p className="font-semibold text-lg">
                    Total: Rs. {totalAmount}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end items-center space-x-4">
                {isEditing ? (
                  <input
                    type="number"
                    className="border rounded px-2 py-1 text-sm w-20"
                    defaultValue={orderCount}
                    onBlur={(e) =>
                      handleSaveNewOrderCount(Number(e.target.value))
                    }
                  />
                ) : (
                  <span className="text-gray-700 text-sm">
                    Receipt Number: <strong>00{orderCount}</strong>
                  </span>
                )}

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-gray-300 px-2 py-1 rounded text-xs"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md"
                >
                  Submit Order
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="container p-4 md:p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-blue-900">
              Selected Products
            </h3>

            {order.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gray-100 rounded-lg shadow-sm text-center">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-3 md:mb-4"
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
                <p className="text-gray-500 text-base md:text-lg font-medium">
                  No products selected yet.
                </p>
                <p className="text-gray-400 text-sm md:text-base mt-1 md:mt-2">
                  Use the product selection to add items to your order.
                </p>
              </div>
            ) : (
              order.items.map((item, index) => (
                <div
                  key={index}
                  className={`mb-4 md:mb-6 p-3 md:p-4 border ${
                    item.urgent ? "bg-red-50 border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4">
                    <h4
                      className={`text-md md:text-lg font-semibold ${
                        item.urgent ? "text-red-700" : "text-gray-800"
                      }`}
                    >
                      {item.product}
                    </h4>

                    <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor={`quantity-${index}`}
                          className="text-blue-700 text-sm md:text-base font-medium"
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
                          className="p-1 md:p-2 w-16 md:w-24 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {options.find((opt) => opt.label === item.product)
                        ?.urgentPrice != null && (
                        <div className="flex items-center space-x-2">
                          <label
                            htmlFor={`urgent-${index}`}
                            className="text-red-700 text-sm md:text-base font-medium"
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
                            className="p-1 md:p-2 border border-gray-300 rounded-md focus:border-red-500 focus:outline-none"
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">Price:</span> Rs.{" "}
                    {item.unitPrice.toFixed(2)}{" "}
                    {item.urgent && (
                      <span className="text-red-600 font-semibold">
                        (Urgent)
                      </span>
                    )}
                  </p>

                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">Amount:</span> Rs.{" "}
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
          onClose={() => setShowModal(false)}
          totalAmount={totalAmount}
        />
      )}
    </>
  );
}
