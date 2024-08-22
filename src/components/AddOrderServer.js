// app/orders/AddOrderServer.js
import prisma from '../../lib/prisma'; // Adjust path as necessary
import AddOrderClient from './AddOrderClient'; // Your client component

async function fetchOrderDetails() {
  try {
    return await prisma.order.findMany({
      select: {
        id: true,
        customer: {
          select: {
            name: true,
            contact: true,
          },
        },
        items: true,
        service: true,
        subtotal: true,
        profit: true,
        status: {
          select: {
            status: true,
          },
        },
        outsourcingCompany: {
          select: {
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export default async function AddOrderServer() {


  const orders = await fetchOrderDetails();

  return (
    <AddOrderClient initialData={orders} />
  );
}
