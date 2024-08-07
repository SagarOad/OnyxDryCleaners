"use client";

import { useState } from 'react';

export default function AddOrder() {
  const [order, setOrder] = useState({
    customer: '',
    service: '',
    items: [{ product: '', quantity: 1, unitPrice: 0, amount: 0 }],
    charges: { pickupCharge: 0, deliveryCharge: 0, discount: 0 }
  });

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...order.items];
    updatedItems[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    setOrder({ ...order, items: updatedItems });
  };

  const handleChargeChange = (field, value) => {
    setOrder({ ...order, charges: { ...order.charges, [field]: value } });
  };

  const handleAddItem = () => {
    setOrder({ ...order, items: [...order.items, { product: '', quantity: 1, unitPrice: 0, amount: 0 }] });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = order.items.filter((_, i) => i !== index);
    setOrder({ ...order, items: updatedItems });
  };

  const subtotal = order.items.reduce((acc, item) => acc + item.amount, 0);
  const taxAmount = (subtotal * 0.07).toFixed(2); // Assuming 7% tax

  // Ensure charges and discount are properly parsed
  const pickupCharge = parseFloat(order.charges.pickupCharge) || 0;
  const deliveryCharge = parseFloat(order.charges.deliveryCharge) || 0;
  const discount = parseFloat(order.charges.discount) || 0;

  const totalAmount = (subtotal + parseFloat(taxAmount) + pickupCharge + deliveryCharge - discount).toFixed(2);

  return (
    <div className="container mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Place New Order</h2>

      <div className="mb-4">
        <label className="block text-gray-700">Customer</label>
        <input
          type="text"
          value={order.customer}
          onChange={(e) => setOrder({ ...order, customer: e.target.value })}
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

      <h3 className="text-xl font-semibold mb-2">Order Details</h3>

      {order.items.map((item, index) => (
        <div key={index} className="flex mb-2 space-x-2 items-center">
          <input
            type="text"
            placeholder="Product"
            value={item.product}
            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
            className="p-2 border border-gray-300 rounded w-1/4"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
            className="p-2 border border-gray-300 rounded w-1/4"
          />
          <input
            type="number"
            placeholder="Unit Price"
            value={item.unitPrice}
            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
            className="p-2 border border-gray-300 rounded w-1/4"
          />
          <input
            type="number"
            placeholder="Amount"
            value={item.amount}
            readOnly
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

      <button onClick={handleAddItem} className="mb-4 bg-blue-500 text-white p-2 rounded">Add New Item</button>

      <h3 className="text-xl font-semibold mb-2">Charges</h3>

      <div className="mb-4 flex space-x-2">
        <div className="w-1/3">
          <label className="block text-gray-700">Pickup Charge</label>
          <input
            type="number"
            value={order.charges.pickupCharge}
            onChange={(e) => handleChargeChange('pickupCharge', parseFloat(e.target.value) || 0)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>
        <div className="w-1/3">
          <label className="block text-gray-700">Delivery Charge</label>
          <input
            type="number"
            value={order.charges.deliveryCharge}
            onChange={(e) => handleChargeChange('deliveryCharge', parseFloat(e.target.value) || 0)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>
        <div className="w-1/3">
          <label className="block text-gray-700">Discount</label>
          <input
            type="number"
            value={order.charges.discount}
            onChange={(e) => handleChargeChange('discount', parseFloat(e.target.value) || 0)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Subtotal</label>
        <input
          type="number"
          value={subtotal.toFixed(2)}
          readOnly
          className="mt-1 p-2 block w-full border border-gray-300 rounded bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Tax Amount</label>
        <input
          type="number"
          value={taxAmount}
          readOnly
          className="mt-1 p-2 block w-full border border-gray-300 rounded bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Total Amount</label>
        <input
          type="number"
          value={totalAmount}
          readOnly
          className="mt-1 p-2 block w-full border border-gray-300 rounded bg-gray-100"
        />
      </div>

      <button className="bg-green-500 text-white p-2 rounded">Submit Order</button>
    </div>
  );
}
