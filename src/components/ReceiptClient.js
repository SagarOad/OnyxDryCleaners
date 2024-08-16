// app/receipt/ReceiptClient.js
"use client"; // Client-side component

import React from "react";

const ReceiptClient = ({ receiptNumber, data, totalAmount, discount, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-96 rounded bg-white px-6 py-8 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
            alt="Logo"
            className="w-20 mb-2"
          />
          <h4 className="text-xl font-semibold">Onyx Dry Cleaners</h4>
          <p className="text-sm text-gray-600 text-center">
            Abdullah Sports City Qasimabad, Hyderabad, Sindh
          </p>
        </div>

        <div className="border-t border-gray-300 py-4">
          <p className="flex justify-between text-sm">
            <span className="font-medium">Receipt No.:</span>
            <span>{receiptNumber}</span>
          </p>
          <p className="flex justify-between text-sm">
            <span className="font-medium">Service Type:</span>
            <span>{data?.service}</span>
          </p>
          <p className="flex justify-between text-sm">
            <span className="font-medium">Host:</span>
            <span>Jane Doe</span>
          </p>
          <p className="flex justify-between text-sm">
            <span className="font-medium">Customer:</span>
            <span>{data?.customer?.name}</span>
          </p>
        </div>

        <div className="mt-4 border-t border-gray-300">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">QTY</th>
                <th className="text-left py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.length ? (
                data.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2">{item.product}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{item.unitPrice}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-2 text-center">
                    No items
                  </td>
                </tr>
              )}
              {discount && (
                <tr>
                  <td colSpan="2" className="py-2 font-medium text-right">
                    Discount
                  </td>
                  <td className="py-2 text-right">-{discount}</td>
                </tr>
              )}
              <tr className="border-t border-gray-300">
                <td colSpan="2" className="py-2 font-medium text-right">
                  Total Amount
                </td>
                <td className="py-2 text-right">{totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-300 px-4 py-2 rounded text-sm text-gray-700"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
            onClick={onConfirm}
          >
            Confirm Order
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded text-sm"
            onClick={() => window.print()}
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptClient;