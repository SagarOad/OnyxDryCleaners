"use client"
import { useState } from 'react';

const dummyCustomers = [
  { id: 1, name: 'Austin Bailey', contact: '123-456-7890' },
  { id: 2, name: 'John Doe', contact: '987-654-3210' }
];

export default function CustomerTable() {
  const [customers, setCustomers] = useState(dummyCustomers);

  return (
    <table className="min-w-full bg-white ">
      <thead className=' text-left'>
        <tr className=''>
          <th className="p-6">Customer ID</th>
          <th className="p-6">Name</th>
          <th className="p-6">Contact</th>
        </tr>
      </thead>
      <tbody>
        {customers.map(customer => (
          <tr key={customer.id}>
            <td className=" py-4 px-6">{customer.id}</td>
            <td className=" py-4 px-6">{customer.name}</td>
            <td className=" py-4 px-6">{customer.contact}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
