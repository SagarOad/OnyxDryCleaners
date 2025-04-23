"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import axios from "axios";
export default function AdminProducts() {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [urgentPrice, setUrgentPrice] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      console.log("Submitting product data:", { name, value, price }); // Log the data being sent

      const response = await axios.post("/api/add-product", {
        name,
        value,
        price,
        urgentPrice,
      });

      console.log("API Response:", response.data); // Log the response

      setSuccess("Product added successfully!");
      setName("");
      setValue("");
      setPrice("");
    } catch (err) {
      setError("Failed to add product.");
      console.error("Error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-white">
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">
              Product Name
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
              Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="p-3 w-full border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="p-3 w-full border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-1">
              Urgent Price
            </label>
            <input
              type="number"
              value={urgentPrice}
              onChange={(e) => setUrgentPrice(e.target.value)}
              className="p-3 w-full border rounded-md"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md"
          >
            Add Product
          </button>
        </form>
      </main>
    </div>
  );
}
