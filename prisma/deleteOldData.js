const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today

  const deleted = await prisma.order.deleteMany({
    where: {
      createdAt: {
        lt: today, // less than today
      },
    },
  });

  console.log(`Deleted ${deleted.count} record(s) older than today.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
