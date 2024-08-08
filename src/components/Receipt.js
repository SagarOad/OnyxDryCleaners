import React from "react";

const Receipt = ({ order, totalAmount, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-80 rounded bg-white p-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Order Receipt</h3>

        <div className="mb-2">
          <strong>Customer:</strong> {order.customer}
        </div>
        <div className="mb-2">
          <strong>Contact:</strong> {order.contact}
        </div>
        <div className="mb-2">
          <strong>Address:</strong> {order.address}
        </div>
        <div className="mb-2">
          <strong>Service:</strong> {order.service}
        </div>

        <h4 className="text-md font-semibold mt-4">Items</h4>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.product} - {item.quantity} x {item.unitPrice} = {item.amount}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <strong>Delivery Charge:</strong> {order.charges.deliveryCharge}
        </div>
        <div>
          <strong>Discount:</strong> {order.charges.discount}%
        </div>
        <div className="mt-4 text-lg">
          <strong>Total:</strong> {totalAmount}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
