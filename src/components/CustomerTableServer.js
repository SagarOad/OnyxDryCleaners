import prisma from '../../lib/prisma'; // Adjust the path as necessary
import OrderTableClient from './OrderTableClient';

// Function to fetch orders from the database
async function fetchOrders() {
  try {
    return await prisma.order.findMany({
      select: {
        id: true,
        orderId: true,
        customerName: true,
        service: true,
        status: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export default async function OrderTableServer() {
  // Fetch orders from the database
  const orders = await fetchOrders();

  // Pass the fetched data to the client component
  return <OrderTableClient initialData={orders} />;
}
