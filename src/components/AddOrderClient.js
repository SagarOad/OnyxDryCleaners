"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import ReceiptClient from "./ReceiptClient";

const productOptions = [
  { label: "Shirt", value: "Shirt", price: 5 },
  { label: "Pants", value: "Pants", price: 7 },
  { label: "Jacket", value: "Jacket", price: 15 },
  { label: "Dress", value: "Dress", price: 12 },
];

export default function AddOrderClient({ initialData }) {
  const [order, setOrder] = useState({
    customer: initialData?.customer?.name || "",
    contact: initialData?.customer?.contact || "",
    address: "",
    service: initialData?.service || "",
    items: [],
    charges: {
      deliveryCharge: initialData?.deliveryCharge || 0,
      discount: initialData?.discount || 0,
    },
    outsourcingCompanyName: initialData?.outsourcingCompany?.name || "",
    outsourcingCost: initialData?.outsourcingCost || 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [errors, setErrors] = useState({});
  const [customerCount, setCustomerCount] = useState(null);
  const [options, setOptions] = useState([]);

  // Handle product selection
  const handleProductChange = (selectedOptions) => {
    const updatedItems = [...order.items];

    // Create a map of selected options for quick lookup
    const selectedOptionsMap = new Map(
      selectedOptions.map((option) => [option.value, option])
    );

    // Update or add new items based on selected options
    selectedOptions.forEach((option) => {
      const existingItemIndex = updatedItems.findIndex(
        (item) => item.product === option.label
      );

      if (existingItemIndex !== -1) {
        // Update the existing item
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          unitPrice: option.price,
          amount: updatedItems[existingItemIndex].quantity * option.price,
        };
      } else {
        // Add new item
        updatedItems.push({
          product: option.label,
          quantity: 1, // Default quantity is 1
          unitPrice: option.price,
          amount: option.price,
        });
      }
    });

    // Remove items that are no longer selected
    const updatedItemsMap = new Map(
      updatedItems.map((item) => [item.product, item])
    );

    setOrder({
      ...order,
      items: [...selectedOptionsMap.values()].map(
        (option) =>
          updatedItemsMap.get(option.label) || {
            product: option.label,
            quantity: 1,
            unitPrice: option.price,
            amount: option.price,
          }
      ),
    });
  };

  // Handle quantity change for a specific product
  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...order.items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].amount = newQuantity * updatedItems[index].unitPrice;

    setOrder({ ...order, items: updatedItems });
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    if (!order.customer) newErrors.customer = "Customer Name is required";
    if (!order.contact) newErrors.contact = "Contact is required";
    if (!order.service) newErrors.service = "Service is required";
    if (!order.outsourcingCompanyName)
      newErrors.outsourcingCompanyName = "Outsourcing Company is required";
    if (order.items.length === 0) {
      newErrors.items = "At least one product must be selected";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await axios.post("/api/add-order", {
        customerName: order.customer,
        customerContact: order.contact,
        customerAddress: order.address,
        service: order.service,
        items: order.items,
        charges: {
          deliveryCharge: parseFloat(order.charges.deliveryCharge) || 0,
          discount: parseFloat(order.charges.discount) || 0,
        },
        status: "received",
        outsourcingCompanyName: order.outsourcingCompanyName,
        outsourcingCost: parseFloat(order.outsourcingCost) || 0,
      });

      setReceiptData(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
      // Reset form after submission
      setOrder({
        customer: "",
        contact: "",
        address: "",
        service: "",
        items: [],
        charges: { deliveryCharge: 0, discount: 0 },
        outsourcingCompanyName: "",
        outsourcingCost: 0,
      });
    }
  };

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const response = await fetch("/api/customer-count");
        const result = await response.json();
        setCustomerCount(result.count);
      } catch (error) {
        console.error("Failed to fetch customer count:", error);
      }
    };

    fetchCustomerCount();
  }, []);

  useEffect(() => {
    // Fetch products from the API
    axios
      .get("/api/get-products")
      .then((response) => {
        const productOptions = response.data.map((product) => ({
          value: product.id,
          label: product.label,
          price: product.price,
        }));
        setOptions(productOptions);
      })
      .catch((error) => {
        console.error("Error fetching product options:", error);
      });
  }, []);

  // Calculate totals
  const subtotal = order.items.reduce((acc, item) => acc + item.amount, 0);
  const deliveryCharge = parseFloat(order.charges.deliveryCharge) || 0;
  const discountPercentage = parseFloat(order.charges.discount) || 0;
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalAmount = (subtotal - discountAmount + deliveryCharge).toFixed(2);

  return (
    <>
      <div className=" grid grid-cols-12">
        <div className="col-span-6">
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
                  {errors.customer && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customer}
                    </p>
                  )}
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
                  <p>Subtotal: {subtotal.toFixed(2)}</p>
                  <p>Delivery Charge: {deliveryCharge.toFixed(2)}</p>
                  <p>Discount: {discountAmount.toFixed(2)}</p>
                  <p className="font-semibold text-lg">Total: Rs. {totalAmount}</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-3 bg-blue-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Submit Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6">
  <div className="container p-6 bg-white rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold mb-6 text-blue-900">
      Selected Products
    </h3>
    {order.items.length === 0 ? (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-sm text-center">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
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
        <p className="text-gray-500 text-lg font-medium">
          No products selected yet.
        </p>
        <p className="text-gray-400 mt-2">
          Use the product selection to add items to your order.
        </p>
      </div>
    ) : (
      order.items.map((item, index) => (
        <div
          key={index}
          className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-800">
              {item.product}
            </h4>
            <div className="flex items-center space-x-4">
              <label
                htmlFor={`quantity-${index}`}
                className="text-blue-700 font-medium"
              >
                Quantity:
              </label>
              <input
                id={`quantity-${index}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(index, parseInt(e.target.value))
                }
                className="p-2 w-24 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-gray-700">
            <span className="font-semibold">Price:</span> Rs.{" "}
            {item.unitPrice.toFixed(2)}
          </p>
          <p className="text-gray-700">
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
          customerCount={customerCount}
          onClose={() => setShowModal(false)}
          totalAmount={totalAmount}
        />
      )}
    </>
  );
}
