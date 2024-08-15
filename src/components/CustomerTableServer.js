// app/customers/CustomerTableServer.js
import prisma from '../../lib/prisma'; // Adjust path as necessary
import CustomerTableClient from './CustomerTable';

async function fetchCustomers() {
  try {
    return await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        contact: true,
        address: true,
        service: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export default async function CustomerTableServer() {
    
  const customers = await fetchCustomers();

  return (
    <CustomerTableClient initialData={customers} />
  );
}
