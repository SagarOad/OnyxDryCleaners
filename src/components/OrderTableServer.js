// /pages/api/get-orders.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { page = 1, pageSize = 10, statusFilter = 'all', searchQuery = '' } = req.query;

  try {
    // Fetch total count of orders for pagination
    const totalCount = await prisma.order.count({
      where: {
        ...(statusFilter !== 'all' && {
          status: {
            status: statusFilter,
          },
        }),
        OR: [
          {
            customer: {
              name: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          },
          {
            service: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    const orders = await prisma.order.findMany({
      where: {
        ...(statusFilter !== 'all' && {
          status: {
            status: statusFilter,
          },
        }),
        OR: [
          {
            customer: {
              name: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          },
          {
            service: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        customer: true,
        status: true,
      },
      skip: (page - 1) * pageSize,
      take: parseInt(pageSize),
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ orders, totalPages });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Something went wrong while fetching orders' });
  }
}
