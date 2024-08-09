// components/Receipt.js
import React, { useEffect, useState } from "react";
import axios from 'axios';

const Receipt = ({ order, totalAmount, onClose, onConfirm }) => {
  const [receiptNumber, setReceiptNumber] = useState('#0000');

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const response = await axios.get('/api/customer-count');
        const customerCount = response.data.count;
        const formattedNumber = (customerCount + 1).toString().padStart(4, '0');
        setReceiptNumber(`#${formattedNumber}`);
      } catch (error) {
        console.error('Failed to fetch customer count:', error);
      }
    };

    fetchCustomerCount();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-80 rounded bg-gray-50 px-6 py-8 shadow-lg">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" 
          alt="Logo" 
          className="mx-auto w-16 py-4" 
        />
        <div className="flex flex-col justify-center items-center gap-2">
          <h4 className="font-semibold">Onyx Dry Cleaners</h4>
          <p className="text-xs text-center">Abdullah Sports City Qasimabad, Hyderabad, Sindh</p>
        </div>
        <div className="flex flex-col gap-3 border-b py-6 text-xs">
          <p className="flex justify-between">
            <span className="text-gray-400">Receipt No.:</span>
            <span>{receiptNumber}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-400">Service Type:</span>
            <span>{order?.service}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-400">Host:</span>
            <span>Jane Doe</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-400">Customer:</span>
            <span>{order?.customer?.name}</span>
          </p>
        </div>
        <div className="flex flex-col gap-3 pb-6 pt-2 text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="flex">
                <th className="w-full py-2">Product</th>
                <th className="min-w-[44px] py-2">QTY</th>
                <th className="min-w-[44px] py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order?.items.map((item, index) => (
                <tr key={index} className="flex">
                  <td className="flex-1 py-1">{item.product}</td>
                  <td className="min-w-[44px]">{item.quantity}</td>
                  <td className="min-w-[44px]">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-b border border-dashed"></div>
          <div className="py-4 justify-center items-center flex flex-col gap-2">
            <p className="flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21.3 12.23h-3.48c-.98 0-1.85.54-2.29 1.42l-.84 1.66c-.2.4-.6.65-1.04.65h-3.28c-.31 0-.75-.07-1.04-.65l-.84-1.65a2.567 2.567 0 0 0-2.29-1.42H2.7c-.39 0-.7.31-.7.7v3.26C2 19.83 4.18 22 7.82 22h8.38c3.43 0 5.54-1.88 5.8-5.22v-3.85c0-.38-.31-.7-.7-.7ZM12.75 2c0-.41-.34-.75-.75-.75s-.75.34-.75.75v2h1.5V2Z" fill="#000"></path>
                <path d="M22 9.81v1.04a2.06 2.06 0 0 0-.7-.12h-3.48c-1.55 0-2.94.86-3.63 2.24l-.75 1.48h-2.86l-.75-1.47a4.026 4.026 0 0 0-3.63-2.25H2.7c-.24 0-.48.04-.7.12V9.81C2 6.17 4.17 4 7.81 4h3.44v3.19l-.72-.72a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2 2c.01.01.02.01.02.02a.753.753 0 0 0 .51.2c.1 0 .19-.02.28-.06.09-.03.18-.09.25-.16l2-2c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-.72.72V4h3.44C19.83 4 22 6.17 22 9.81Z" fill="#000"></path>
              </svg>
              info@example.com
            </p>
            <p className="flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path fill="#000" d="M11.05 14.95L9.2 16.8c-.39.39-1.01.39-1.41.01-.11-.11-.22-.21-.33-.32a28.414 28.414 0 01-2.79-3.27c-.82-1.14-1.48-2.28-1.96-3.41C2.24 8.67 2 7.58 2 6.54c0-.68.12-1.33.36-1.93.24-.61.62-1.17 1.15-1.67C4.15 2.31 4.85 2 5.59 2c.28 0 .56.06.81.18.26.12.49.3.67.56l2.32 3.27c.18.25.31.48.4.7.09.21.14.42.14.61 0 .24-.07.48-.21.71-.13.23-.32.47-.56.71l-.76.79c-.11.11-.16.24-.16.4 0 .08.01.15.03.23.03.08.06.14.08.2.18.33.49.76.93 1.28.45.52.93 1.05 1.45 1.58.1.1.21.2.31.3.4.39.41 1.03.01 1.43zM21.97 18.33a2.54 2.54 0 0 0-.68-1.03l-1.74-1.74c-.55-.55-1.29-.9-2.1-.9H2.7v3.26c0 1.44 1.17 2.61 2.61 2.61h11.29c2.6 0 4.62-1.45 4.67-4.04v-2.13c.1-.12.2-.25.31-.37l1.74-1.74a2.537 2.537 0 0 0 .68-1.03Z" />
              </svg>
              +92*******
            </p>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded text-sm"
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

export default Receipt;
