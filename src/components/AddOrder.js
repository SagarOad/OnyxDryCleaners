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

  const subtotal = order.items.reduce((acc, item) => acc + item.amount, 0);

  const deliveryCharge = parseFloat(order.charges.deliveryCharge) || 0;
  const discountPercentage = parseFloat(order.charges.discount) || 0;
  const discountAmount = (subtotal * discountPercentage) / 100;

  const totalAmount = (subtotal + deliveryCharge - discountAmount).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true); // Show the receipt modal
  };

  const handleConfirmOrder = async () => {
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
          totalAmount: (order.items.reduce((acc, item) => acc + item.amount, 0) + parseFloat(order.charges.deliveryCharge) - (order.items.reduce((acc, item) => acc + item.amount, 0) * parseFloat(order.charges.discount) / 100)).toFixed(2),
          pickupCharge: 0,
          deliveryCharge: parseFloat(order.charges.deliveryCharge) || 0,
          discount: parseFloat(order.charges.discount) || 0,
        },
        status: "received",
      });

      console.log("Order successfully created:", response.data);
      setShowModal(false); // Close the modal after confirming the order

      // Optionally reset the order form after submission
      setOrder({
        customer: "",
        contact: "",
        address: "",
        service: "",
        items: [{ product: "", quantity: 1, unitPrice: "", amount: 0 }],
        charges: { deliveryCharge: 0, discount: 0 },
      });
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Place New Order</h2>

        {/* Customer Information */}
        <div className="mb-4">
          <label className="block text-gray-700">Customer Name</label>
          <input
            type="text"
            value={order.customer}
            onChange={(e) => setOrder({ ...order, customer: e.target.value })}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Contact</label>
          <input
            type="text"
            value={order.contact}
            onChange={(e) => setOrder({ ...order, contact: e.target.value })}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            value={order.address}
            onChange={(e) => setOrder({ ...order, address: e.target.value })}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Service</label>
          <input
            type="text"
            value={order.service}
            onChange={(e) => setOrder({ ...order, service: e.target.value })}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>

        {/* Order Details */}
        <h3 className="text-xl font-semibold mb-2">Order Details</h3>

        {order.items.map((item, index) => (
          <div key={index} className="flex mb-2 space-x-2 items-center">
            <input
              type="text"
              placeholder="Product"
              value={item.product}
              onChange={(e) => handleItemChange(index, "product", e.target.value)}
              className="p-2 border border-gray-300 rounded w-1/4"
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={item.unitPrice}
              onChange={(e) =>
                handleItemChange(
                  index,
                  "unitPrice",
                  parseFloat(e.target.value)
                )
              }
              className="p-2 border border-gray-300 rounded w-1/4"
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
              className="p-2 border border-gray-300 rounded w-1/4"
            />

            <button
              onClick={() => handleRemoveItem(index)}
              className="p-2 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={handleAddItem}
          className="mb-4 bg-blue-500 text-white p-2 rounded"
        >
          Add New Item
        </button>

        {/* Charges */}
        <h3 className="text-xl font-semibold mb-2">Charges</h3>

        <div className="mb-4 flex space-x-2">
          <div className="w-1/2">
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
          <div className="w-1/2">
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

        {/* Total Amount */}
        <div className="mb-4">
          <label className="block text-gray-700">Total Amount</label>
          <input
            type="number"
            value={totalAmount}
            readOnly
            className="mt-1 p-2 block w-full border border-gray-300 rounded bg-gray-100"
          />
        </div>

        {/* Submit Order Button */}
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white p-2 rounded"
        >
          Submit Order
        </button>
      </div>

      {/* Receipt Modal */}
      {showModal && (
        <Receipt
          order={order}
          totalAmount={totalAmount}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmOrder}
        />
      )}
    </>
  );
}
