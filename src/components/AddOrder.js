"use client";

import { useState } from "react";
import Receipt from "../components/Receipt";
import axios from "axios";

export default function AddOrder() {
  const [order, setOrder] = useState({
    customer: "",
    contact: "",
    address: "",
    service: "",
    items: [{ product: "", quantity: 1, unitPrice: "", amount: 0 }],
    charges: { deliveryCharge: 0, discount: 0 },
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [errors, setErrors] = useState({});

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...order.items];
    updatedItems[index][field] = value;
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].amount =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    setOrder({ ...order, items: updatedItems });
  };

  const handleChargeChange = (field, value) => {
    setOrder({ ...order, charges: { ...order.charges, [field]: value } });
  };

  const handleAddItem = () => {
    setOrder({
      ...order,
      items: [
        ...order.items,
        { product: "", quantity: 1, unitPrice: 0, amount: 0 },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = order.items.filter((_, i) => i !== index);
    setOrder({ ...order, items: updatedItems });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!order.customer) newErrors.customer = "Customer Name is required";
    if (!order.contact) newErrors.contact = "Contact is required";
    if (!order.service) newErrors.service = "Service is required";
    if (order.items.length === 0 || order.items.every(item => !item.product || !item.unitPrice || !item.quantity)) {
      newErrors.items = "At least one order detail is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
          subtotal: order.items.reduce((acc, item) => acc + item.amount, 0),
          taxAmount: 0,
          totalAmount: (
            order.items.reduce((acc, item) => acc + item.amount, 0) +
            parseFloat(order.charges.deliveryCharge) -
            (order.items.reduce((acc, item) => acc + item.amount, 0) *
              parseFloat(order.charges.discount)) /
              100
          ).toFixed(2),
          pickupCharge: 0,
          deliveryCharge: parseFloat(order.charges.deliveryCharge) || 0,
          discount: parseFloat(order.charges.discount) || 0,
        },
        status: "processing",
      });

      setReceiptData(response.data); // Set receipt data
      setShowModal(true); // Show receipt modal
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const subtotal = order.items.reduce((acc, item) => acc + item.amount, 0);
  const deliveryCharge = parseFloat(order.charges.deliveryCharge) || 0;
  const discountPercentage = parseFloat(order.charges.discount) || 0;
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalAmount = (subtotal + deliveryCharge - discountAmount).toFixed(2);

  return (
    <>
      <div className="container mx-auto p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Place New Order</h2>

        {/* Customer Information */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-gray-700">Customer Name</label>
            <input
              type="text"
              value={order.customer}
              onChange={(e) => setOrder({ ...order, customer: e.target.value })}
              className={`mt-1 p-2 block w-full border border-gray-300 rounded ${
                errors.customer ? "border-red-500" : ""
              }`}
            />
            {errors.customer && (
              <p className="text-red-500 text-sm">{errors.customer}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Contact</label>
            <input
              type="text"
              value={order.contact}
              onChange={(e) => setOrder({ ...order, contact: e.target.value })}
              className={`mt-1 p-2 block w-full border border-gray-300 rounded ${
                errors.contact ? "border-red-500" : ""
              }`}
            />
            {errors.contact && (
              <p className="text-red-500 text-sm">{errors.contact}</p>
            )}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              value={order.address}
              onChange={(e) => setOrder({ ...order, address: e.target.value })}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Service</label>
            <input
              type="text"
              value={order.service}
              onChange={(e) => setOrder({ ...order, service: e.target.value })}
              className={`mt-1 p-2 block w-full border border-gray-300 rounded ${
                errors.service ? "border-red-500" : ""
              }`}
            />
            {errors.service && (
              <p className="text-red-500 text-sm">{errors.service}</p>
            )}
          </div>
        </div>

        {/* Order Details */}
        <h3 className="text-xl font-semibold mb-2">Order Details</h3>

        {order.items.map((item, index) => (
          <div key={index} className="flex mb-2 space-x-2 items-center">
            <input
              type="text"
              placeholder="Product"
              value={item.product}
              onChange={(e) =>
                handleItemChange(index, "product", e.target.value)
              }
              className={`p-2 border border-gray-300 rounded w-1/4 ${
                errors.items ? "border-red-500" : ""
              }`}
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={item.unitPrice}
              onChange={(e) =>
                handleItemChange(index, "unitPrice", parseFloat(e.target.value))
              }
              className={`p-2 border border-gray-300 rounded w-1/4 ${
                errors.items ? "border-red-500" : ""
              }`}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(
                  index,
                  "quantity",
                  parseFloat(e.target.value) || 0
                )
              }
              className={`p-2 border border-gray-300 rounded w-1/4 ${
                errors.items ? "border-red-500" : ""
              }`}
            />

            <button
              onClick={() => handleRemoveItem(index)}
              className="p-2 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </div>
        ))}
        {errors.items && (
          <p className="text-red-500 text-sm mb-2">{errors.items}</p>
        )}
        <button
          onClick={handleAddItem}
          className="mb-4 bg-blue-500 text-white p-2 rounded"
        >
          Add New Item
        </button>

        {/* Charges */}
        <h3 className="text-xl font-semibold mb-2">Charges</h3>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-gray-700">Delivery Charge</label>
            <input
              type="number"
              value={order.charges.deliveryCharge}
              onChange={(e) =>
                handleChargeChange(
                  "deliveryCharge",
                  parseFloat(e.target.value) || 0
                )
              }
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Discount (%)</label>
            <input
              type="number"
              value={order.charges.discount}
              onChange={(e) =>
                handleChargeChange("discount", parseFloat(e.target.value) || 0)
              }
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Order"}
          </button>
        </div>
      </div>

      {showModal && receiptData && (
        <Receipt
          data={receiptData}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
