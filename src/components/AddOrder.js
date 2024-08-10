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
    if (
      order.items.length === 0 ||
      order.items.some(
        (item) => !item.product || !item.unitPrice || !item.quantity
      )
    ) {
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
        status: "received",
      });

      setReceiptData(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
      setOrder({
        customer: "",
        contact: "",
        address: "",
        service: "",
        items: [{ product: "", quantity: 1, unitPrice: "", amount: 0 }],
        charges: { deliveryCharge: 0, discount: 0 },
      });
    }
  };

  const subtotal = order.items.reduce((acc, item) => acc + item.amount, 0);
  const deliveryCharge = parseFloat(order.charges.deliveryCharge) || 0;
  const discountPercentage = parseFloat(order.charges.discount) || 0;
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalAmount = (subtotal + deliveryCharge - discountAmount).toFixed(2);
  return (
    <>
      <div className=" flex  justify-left">
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
                <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
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
                <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
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
                className="p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 border-gray-300"
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
                <p className="text-red-500 text-xs mt-1">{errors.service}</p>
              )}
            </div>
          </div>

          {/* Order Details */}
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            Order Details
          </h3>

          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center mb-4 gap-2"
            >
              <input
                type="text"
                placeholder="Product"
                value={item.product}
                onChange={(e) =>
                  handleItemChange(index, "product", e.target.value)
                }
                className={`p-3 border rounded-md w-full md:w-1/4 focus:ring-2 focus:ring-blue-500 ${
                  errors.items ? "border-red-500" : "border-gray-300"
                }`}
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
                className={`p-3 border rounded-md w-full md:w-1/4 focus:ring-2 focus:ring-blue-500 ${
                  errors.items ? "border-red-500" : "border-gray-300"
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
                className={`p-3 border rounded-md w-full md:w-1/4 focus:ring-2 focus:ring-blue-500 ${
                  errors.items ? "border-red-500" : "border-gray-300"
                }`}
              />

              <button
                onClick={() => handleRemoveItem(index)}
                className="p-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          {errors.items && (
            <p className="text-red-500 text-xs mb-4">{errors.items}</p>
          )}

          <button
            onClick={handleAddItem}
            className="p-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 mb-6"
          >
            Add Item
          </button>

          {/* Charges */}
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Charges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-blue-700 font-medium mb-1">
                Delivery Charge
              </label>
              <input
                type="number"
                value={order.charges.deliveryCharge}
                onChange={(e) =>
                  handleChargeChange("deliveryCharge", e.target.value)
                }
                className="p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>
            <div>
              <label className="block text-blue-700 font-medium mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                value={order.charges.discount}
                onChange={(e) => handleChargeChange("discount", e.target.value)}
                className="p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full p-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:bg-gray-300"
          >
            {loading ? "Submitting..." : "Submit Order"}
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between mb-6">
            <div className="text-blue-800 font-medium">Subtotal:</div>
            <div className="text-blue-800">${subtotal.toFixed(2)}</div>
          </div>
          <div className="flex justify-between mb-6">
            <div className="text-blue-800 font-medium">Discount:</div>
            <div className="text-blue-800">-${discountAmount.toFixed(2)}</div>
          </div>
          <div className="flex justify-between mb-6">
            <div className="text-blue-800 mr-10 font-medium">Delivery Charge:</div>
            <div className="text-blue-800">${deliveryCharge.toFixed(2)}</div>
          </div>
          <div className="flex justify-between mb-6">
            <div className="text-blue-800 font-medium">Total:</div>
            <div className="text-blue-800 font-bold">${totalAmount}</div>
          </div>
        </div>
      </div>
      {showModal && (
        <Receipt
          data={receiptData}
          // customerName={customerName}
          totalAmount={totalAmount}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
