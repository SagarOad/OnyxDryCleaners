// pages/orders/[id].js
import prisma from '../../../lib/prisma'; // Adjust the path if needed
import AddOrderClient from '@/components/AddOrderClient'; // Adjust the path if needed

export async function getServerSideProps(context) {
  const { id } = context.params; // Get order ID from the URL

  // Fetch order details from the database
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    select: {
      customer: {
        select: {
          name: true,
          contact: true,
        },
      },
      items: {
        select: {
          product: true,
          quantity: true,
          unitPrice: true,
          amount: true,
        },
      },
      service: true,
      deliveryCharge: true,
      discount: true,
      outsourcingCompany: {
        select: { name: true },
      },
      outsourcingCost: true,
    },
  });

  if (!order) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialData: order, // Pass the fetched order data as props
    },
  };
}

export default function OrderPage({ initialData }) {
  return (
    <div>
      <AddOrderClient initialData={initialData} />
    </div>
  );
}
