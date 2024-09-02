"use client"; // Client-side component

import React from "react";
import Image from "next/image";
import logo from "@/assets/onyxlogo.jpg";

const ReceiptClient = ({ data, customerCount, onClose }) => {

  const totalAmount = (data?.subtotal - data?.discount + data?.deliveryCharge);


  const summaryPrint = () => {
    // Get elements to hide and show
    const hidePrintElements = document.querySelectorAll("#receipt");
    // Add classes to hide elements before printing
    hidePrintElements.forEach((element) => {
      element.classList.remove("receipt-container");
    });
    window.print();
    // Remove classes after printing
    hidePrintElements.forEach((element) => {
      element.classList.add("receipt-container");
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div id="receipt" className="receipt-container w-[27rem] rounded bg-white px-6 py-8 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <Image src={logo} alt="Logo" className="w-20 mb-2" />
          <h4 className="text-xl font-semibold">Onyx Dry Cleaners</h4>
          <p className="text-[12px] text-gray-600 text-center">
            Abdullah Sports City Qasimabad, Hyderabad, Sindh
          </p>
        </div>

        <div className="border-t border-gray-300 py-4">
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left">Customer Count:</span>
            <span>00{customerCount}</span>
          </p>
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left">Service Type:</span>
            <span>{data?.service}</span>
          </p>
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left">Host:</span>
            <span>Vijay Kumar</span>
          </p>
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left">Customer:</span>
            <span>{data?.customer?.name}</span>
          </p>
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left">Address:</span>
            <span className=" w-[200px]">{data?.customer?.address}</span>
          </p>
        </div>

        <div className="mt-4 border-t border-gray-300">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-[12px] py-2">Product</th>
                <th className="text-left text-[12px] py-2">QTY</th>
                <th className="text-right text-[12px] py-2">Unit Price</th>
                <th className="text-right text-[12px] py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.length ? (
                data.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 text-left">{item.product}</td>
                    <td className="py-2 text-left">{item.quantity}</td>
                    <td className="py-2 pl-2 text-right">{item.unitPrice}</td>
                    <td className="py-2 pl-2 text-right">{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 text-center">
                    No items
                  </td>
                </tr>
              )}
              {data?.charges?.discount > 0 && (
                <tr>
                  <td colSpan="3" className="py-2 font-medium text-right">
                    Discount
                  </td>
                  <td className="py-2 text-right">-${(data?.subtotal * (data?.charges?.discount / 100)).toFixed(2)}</td>
                </tr>
              )}
                <tr className="border-t border-gray-300">
                <td colSpan="3" className="py-2 pr-2 font-medium text-right">
                  Total
                </td>
                <td className="py-2 text-right">Rs. {data?.subtotal}</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td colSpan="3" className="py-2 pr-2 font-medium text-right">
                  Delivery Charge
                </td>
                <td className="py-2 text-right">Rs. {data?.deliveryCharge}</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td colSpan="3" className="py-2 pr-2 font-medium text-right">
                  Discount
                </td>
                <td className="py-2 text-right">{data?.discount}%</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td colSpan="3" className="py-2 pr-2 font-medium text-right">
                  Sub Total
                </td>
                <td className="py-2 text-right">Rs. {totalAmount}</td>
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
            className="bg-green-500 text-white px-4 py-2 rounded text-sm"
            onClick={() => summaryPrint()}
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptClient;
