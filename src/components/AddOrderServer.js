// import prisma from '../../lib/prisma'; // Adjust path as necessary
// import AddOrderClient from './AddOrderClient'; // Your client component

// // Fetch order details from the database
// async function fetchOrderDetails() {
//   try {
//     const orders = await prisma.order.findMany({
//       select: {
//         id: true,
//         customer: {
//           select: {
//             name: true,
//             contact: true,
//           },
//         },
//         items: true,
//         service: true,
//         subtotal: true,
//         profit: true,
//         status: {
//           select: {
//             status: true,
//           },
//         },
//         outsourcingCompany: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });
//     return orders;
//   } catch (error) {
//     console.error('Failed to fetch orders:', error);
//     return [];
//   }
// }

// export default async function AddOrderServer() {
//   const orders = await fetchOrderDetails(); // Fetch orders from the database

//   return (
//     <>
//       {orders && orders.length > 0 ? (
//         <AddOrderClient initialData={orders} />
//       ) : (
//         <p>No orders found.</p>
//       )}
//     </>
//   );
// }
