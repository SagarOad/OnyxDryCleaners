"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import axios from "axios";

export default function AddExistingCustomer() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [service, setService] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name) {
      setError("Customer name is required.");
      return;
    }

    try {
      const response = await axios.post("/api/add-existing-customer", {
        name,
        contact: contact || null, // optional fields
        address: address || null, // optional fields
        service: service || null, // optional fields
      });

      setSuccess("Customer added successfully!");
      setName("");
      setContact("");
      setAddress("");
      setService("");
    } catch (err) {
      setError("Failed to add customer.");
      console.error("Error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-white">
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">
          Add New Existing Customer
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 w-full border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">
              Contact (Optional)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="p-3 w-full border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">
              Address (Optional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="p-3 w-full border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">
              Service (Optional)
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="p-3 w-full border rounded-md"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md"
          >
            Add Customer
          </button>
        </form>
      </main>
    </div>
  );
}
