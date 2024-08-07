"use client"
import { useState } from 'react';

const dummyOrders = [
  {
    id: 1,
    customer: { name: 'Austin Bailey' },
    service: 'Dry Cleaning',
    status: 'received',
    items: [
      { product: 'Top/Shirt-Silk', quantity: 2, unitPrice: 6.50, amount: 13.00 },
      { product: 'Cardigan', quantity: 1, unitPrice: 5.80, amount: 5.80 }
    ],
    charges: { subtotal: 18.80, taxAmount: 1.32, totalAmount: 20.12, pickupCharge: 50, deliveryCharge: 30 }
  },
  {
    id: 2,
    customer: { name: 'John Doe' },
    service: 'Washing',
    status: 'processing',
    items: [
      { product: 'Pants', quantity: 3, unitPrice: 3.00, amount: 9.00 },
      { product: 'Jacket', quantity: 1, unitPrice: 10.00, amount: 10.00 }
    ],
    charges: { subtotal: 19.00, taxAmount: 1.52, totalAmount: 20.52, pickupCharge: 50, deliveryCharge: 30 }
  },
];

export default function OrderTable() {
  const [orders, setOrders] = useState(dummyOrders);

  const updateOrderStatus = (orderId, status) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2">Order ID</th>
          <th className="py-2">Customer</th>
          <th className="py-2">Service</th>
          <th className="py-2">Status</th>
          <th className="py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td className="py-2">{order.id}</td>
            <td className="py-2">{order.customer.name}</td>
            <td className="py-2">{order.service}</td>
            <td className="py-2">{order.status}</td>
            <td className="py-2">
              <button onClick={() => updateOrderStatus(order.id, 'processing')} className="mr-2">Processing</button>
              <button onClick={() => updateOrderStatus(order.id, 'complete')}>Complete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
