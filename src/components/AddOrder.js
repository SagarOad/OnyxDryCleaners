"use client";

import { useState } from "react";
import axios from "axios";
import Receipt from "../components/Receipt";

export default function AddOrder() {
  const [order, setOrder] = useState({
    customer: "",
    contact: "",
    address: "",
    service: "",
    items: [{ product: "", quantity: 1, unitPrice: 0, amount: 0 }],
    charges: { deliveryCharge: 0, discount: 0 },
    outsourcingCompanyName: "",
    outsourcingCost: 0,
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
    if (!order.outsourcingCompanyName)
      newErrors.outsourcingCompanyName = "Outsourcing Company is required";
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
      setOrder({
        customer: "",
        contact: "",
        address: "",
        service: "",
        items: [{ product: "", quantity: 1, unitPrice: 0, amount: 0 }],
        charges: { deliveryCharge: 0, discount: 0 },
        outsourcingCompanyName: "",
        outsourcingCost: 0,
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
                <p className="text-red-500 text-xs mt-1">{errors.service}</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Items</h3>
            {order.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Product
                  </label>
                  <input
                    type="text"
                    value={item.product}
                    onChange={(e) =>
                      handleItemChange(index, "product", e.target.value)
                    }
                    className="p-3 w-full border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", parseInt(e.target.value))
                    }
                    className="p-3 w-full border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", parseFloat(e.target.value))
                    }
                    className="p-3 w-full border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={item.amount}
                    readOnly
                    className="p-3 w-full border rounded-md bg-gray-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 mt-4"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Item
            </button>
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
                  handleChargeChange("deliveryCharge", parseFloat(e.target.value))
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
                  handleChargeChange("discount", parseFloat(e.target.value))
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
                setOrder({ ...order, outsourcingCompanyName: e.target.value })
              }
              className={`p-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 ${
                errors.outsourcingCompanyName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.outsourcingCompanyName && (
              <p className="text-red-500 text-xs mt-1">{errors.outsourcingCompanyName}</p>
            )}
            <label className="block text-blue-700 font-medium mt-4 mb-1">
              Outsourcing Cost
            </label>
            <input
              type="number"
              value={order.outsourcingCost}
              onChange={(e) =>
                setOrder({ ...order, outsourcingCost: parseFloat(e.target.value) })
              }
              className="p-3 w-full border rounded-md"
            />
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="font-medium">Subtotal</div>
              <div className="text-right">{subtotal.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="font-medium">Delivery Charge</div>
              <div className="text-right">{deliveryCharge.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="font-medium">Discount</div>
              <div className="text-right">-{discountAmount.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="font-medium">Total</div>
              <div className="text-right">{totalAmount}</div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`bg-blue-500 text-white px-4 py-2 rounded ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Order"}
            </button>
          </div>
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