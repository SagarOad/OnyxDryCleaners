"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function CustomerTable() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("/api/get-customers");
        setCustomers(response.data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };

    fetchCustomers();
  }, []);

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
