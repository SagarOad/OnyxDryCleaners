"use client";
import { useState } from "react";

const dummyCustomers = [
  {
    id: 1,
    name: "Austin Bailey",
    contact: "123-456-7890",
    address: "123 Elm Street",
    service: "Washing",
  },
  {
    id: 2,
    name: "John Doe",
    contact: "987-654-3210",
    address: "456 Oak Avenue",
    service: "Dry Cleaning",
  },
];

export default function CustomerTable() {
  const [customers, setCustomers] = useState(dummyCustomers);

  return (
    <table className="min-w-full bg-white">
      <thead className="text-left">
        <tr>
          <th className="p-6">Customer ID</th>
          <th className="p-6">Name</th>
          <th className="p-6">Contact</th>
          <th className="p-6">Address</th>
          <th className="p-6">Service</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => (
          <tr key={customer.id}>
            <td className="py-4 px-6">{customer.id}</td>
            <td className="py-4 px-6">{customer.name}</td>
            <td className="py-4 px-6">{customer.contact}</td>
            <td className="py-4 px-6">{customer.address}</td>
            <td className="py-4 px-6">{customer.service}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
