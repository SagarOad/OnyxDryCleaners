// prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add initial statuses
  await prisma.orderStatus.createMany({
    data: [
      { status: 'received' },
      { status: 'processing' },
      { status: 'completed' },
      { status: 'cancelled' },
    ],
  });

  console.log("Seed data inserted");
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
