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
      <div id="receipt" className="receipt-container w-[24rem] rounded bg-white px-6 py-8 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <Image src={logo} alt="Logo" className="w-20 mb-2" />
          <h4 className="text-xl font-semibold text-black">Onyx Dry Cleaners</h4>
          <p className="text-[12px] text-black text-center">
            Abdullah Sports Tower Qasimabad, Hyderabad, Sindh
          </p>
        </div>

        <div className="border-t border-gray-300 py-4">
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left text-black">Customer Count:</span>
            <span className=" text-black">00{customerCount}</span>
          </p>
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left text-black">Service Type:</span>
            <span className=" text-black">{data?.service}</span>
          </p>
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left text-black">Host:</span>
            <span className=" text-black">Vijay Kumar</span>
          </p>
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left text-black">Customer:</span>
            <span className=" text-black">{data?.customer?.name}</span>
          </p>
          <p className="flex justify-between text-sm mb-2">
            <span className="font-medium text-left text-black">Address:</span>
            <span className=" w-[200px] text-black">{data?.customer?.address}</span>
          </p>
        </div>

        <div className="mt-4 border-t border-gray-300">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-black text-[12px] py-2">Product</th>
                <th className="text-left text-black text-[12px] py-2">QTY</th>
                <th className="text-right text-black text-[12px] py-2">Unit Price</th>
                <th className="text-right text-black text-[12px] py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.length ? (
                data.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 text-black text-left">{item.product}</td>
                    <td className="py-2 text-black text-left">{item.quantity}</td>
                    <td className="py-2 text-black pl-2 text-right">{item.unitPrice}</td>
                    <td className="py-2 text-black pl-2 text-right">{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 text-black text-center">
                    No items
                  </td>
                </tr>
              )}
              {data?.charges?.discount > 0 && (
                <tr className=" text-black">
                  <td colSpan="3" className="py-2 text-black font-medium text-right">
                    Discount
                  </td>
                  <td className="py-2 text-right text-black">-${(data?.subtotal * (data?.charges?.discount / 100)).toFixed(2)}</td>
                </tr>
              )}
                <tr className="border-t border-gray-300 text-black">
                <td colSpan="3" className="py-2 pr-2 font-medium text-black text-right">
                  Total
                </td>
                <td className="py-2 text-right text-black">Rs. {data?.subtotal}</td>
              </tr>
              <tr className="border-t border-gray-300 text-black">
                <td colSpan="3" className="py-2 pr-2 text-black font-medium text-right">
                  Delivery Charge
                </td>
                <td className="py-2 text-right text-black">Rs. {data?.deliveryCharge}</td>
              </tr>
              <tr className="border-t border-gray-300 text-black">
                <td colSpan="3" className="py-2 pr-2 text-black font-medium text-right">
                  Discount
                </td>
                <td className="py-2 text-right text-black">{data?.discount}</td>
              </tr>
              <tr className="border-t border-gray-300 text-black">
                <td colSpan="3" className="py-2 pr-2 text-black font-medium text-right">
                  Grand Total
                </td>
                <td className="py-2 text-right text-black">Rs. {totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-6 text-black">
          <button
            className="bg-gray-300 px-4 py-2 rounded text-sm text-black"
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
