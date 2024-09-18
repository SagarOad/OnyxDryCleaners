"use client";

import React from "react";
import Image from "next/image";
import logo from "@/assets/onyxlogo.jpg";

const ReceiptClient = ({ data, customerCount, onClose }) => {
  const totalAmount = data?.subtotal - data?.discount + data?.deliveryCharge;

  const summaryPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div id="receipt" className="receipt-container bg-white px-4 py-6 shadow-lg">
        <div className="text-center mb-4">
          <Image src={logo} alt="Logo" className="w-16 mx-auto mb-2" />
          <h4 className="text-lg font-semibold">Onyx Dry Cleaners</h4>
          <p className="text-xs">
            Abdullah Sports Tower Qasimabad, Hyderabad, Sindh
          </p>
          <p className="text-xs">Phone: 575-1628095</p>
        </div>

        <div className="mb-4 text-sm">
          <p>Date: {new Date().toLocaleDateString()}</p>
          <p>Customer Count: 00{customerCount}</p>
          <p>Service Type: {data?.service}</p>
          <p>Host: Vijay Kumar</p>
          <p>Customer: {data?.customer?.name}</p>
          <p>Address: {data?.customer?.address}</p>
        </div>

        <div className="mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left">Product</th>
                <th className="text-left">QTY</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.length ? (
                data.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product}</td>
                    <td>{item.quantity}</td>
                    <td className="text-right">{item.unitPrice}</td>
                    <td className="text-right">{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-right text-sm">
          <p>Subtotal: Rs. {data?.subtotal}</p>
          <p>Delivery Charge: Rs. {data?.deliveryCharge}</p>
          <p>Discount: Rs. {data?.discount}</p>
          <p className="font-bold">Total: Rs. {totalAmount}</p>
        </div>

        <div className="text-center text-sm mt-4">
          <p>Thanks for supporting local business!</p>
          <p>THANK YOU</p>
        </div>

        <div className="flex justify-between mt-6">
          <button className="bg-gray-300 px-4 py-2 rounded text-xs" onClick={onClose}>
            Close
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded text-xs" onClick={() => summaryPrint()}>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptClient;
