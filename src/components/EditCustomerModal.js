import React, { useState } from "react";

const EditCustomerModal = ({ customer, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ ...customer });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-md">
        <h2 className="text-lg font-semibold mb-4">Edit Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Customer Name"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Contact"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            name="service"
            value={formData.service}
            onChange={handleChange}
            placeholder="Service"
            className="w-full px-3 py-2 border rounded"
          />
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;
