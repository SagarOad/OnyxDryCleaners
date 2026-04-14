/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function countNull(modelName) {
  return prisma[modelName].count({ where: { businessId: null } });
}

async function main() {
  const checks = await Promise.all([
    countNull("customer"),
    countNull("order"),
    countNull("orderItem"),
    countNull("product"),
    countNull("existingCustomers"),
    countNull("outsourcingCompany"),
  ]);
  const labels = [
    "Customer",
    "Order",
    "OrderItem",
    "Product",
    "ExistingCustomers",
    "OutsourcingCompany",
  ];
  let failed = false;
  labels.forEach((label, idx) => {
    const val = checks[idx];
    console.log(`${label} rows with null businessId: ${val}`);
    if (val > 0) failed = true;
  });

  const duplicateProducts = await prisma.$queryRaw`
    SELECT "businessId", value, COUNT(*)::int AS c
    FROM "Product"
    GROUP BY "businessId", value
    HAVING COUNT(*) > 1
    LIMIT 5
  `;
  if (duplicateProducts.length > 0) {
    failed = true;
    console.log("Duplicate product values within same business found.");
  }

  if (failed) {
    console.error("Validation failed. Resolve issues before strict cutover.");
    process.exit(1);
  }
  console.log("Validation passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

