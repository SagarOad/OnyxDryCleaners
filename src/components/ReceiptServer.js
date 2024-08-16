// app/receipt/ReceiptServer.js
import prisma from '../../lib/prisma'; // Adjust path as needed
import ReceiptClient from './ReceiptClient';

// Fetch customer count to generate receipt number
async function fetchCustomerCount() {
  try {
    const count = await prisma.customer.count();
    const formattedNumber = (count + 1).toString().padStart(4, "0");
    return `#${formattedNumber}`;
  } catch (error) {
    console.error("Failed to fetch customer count:", error);
    return "#0000";
  }
}

export default async function ReceiptServer({ data, totalAmount, discount, onClose, onConfirm }) {
  const receiptNumber = await fetchCustomerCount(); // Fetch the receipt number on the server

  // Pass data to the client component
  return (
    <ReceiptClient
      receiptNumber={receiptNumber}
      data={data}
      totalAmount={totalAmount}
      discount={discount}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
