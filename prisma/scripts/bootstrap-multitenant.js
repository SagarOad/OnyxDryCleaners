/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const defaultSlug = process.env.DEFAULT_BUSINESS_SLUG || "default-business";
  const defaultName = process.env.DEFAULT_BUSINESS_NAME || "Default Business";
  const superUsername = process.env.SUPERADMIN_USERNAME || "superadmin";
  const superPassword = process.env.SUPERADMIN_PASSWORD || "ChangeMe123!";

  const business = await prisma.business.upsert({
    where: { slug: defaultSlug },
    update: {},
    create: {
      name: defaultName,
      slug: defaultSlug,
      status: "active",
      plan: "legacy",
      paymentStatus: "paid",
    },
  });

  await prisma.$transaction([
    prisma.customer.updateMany({
      where: { businessId: null },
      data: { businessId: business.id },
    }),
    prisma.order.updateMany({
      where: { businessId: null },
      data: { businessId: business.id },
    }),
    prisma.orderItem.updateMany({
      where: { businessId: null },
      data: { businessId: business.id },
    }),
    prisma.product.updateMany({
      where: { businessId: null },
      data: { businessId: business.id },
    }),
    prisma.existingCustomers.updateMany({
      where: { businessId: null },
      data: { businessId: business.id },
    }),
    prisma.outsourcingCompany.updateMany({
      where: { businessId: null },
      data: { businessId: business.id },
    }),
  ]);

  const legacyAdmin = await prisma.admin.findFirst();
  if (legacyAdmin) {
    await prisma.businessUser.upsert({
      where: {
        businessId_username: {
          businessId: business.id,
          username: legacyAdmin.email,
        },
      },
      update: {
        password: legacyAdmin.password,
        role: "business_admin",
      },
      create: {
        businessId: business.id,
        username: legacyAdmin.email,
        email: legacyAdmin.email,
        password: legacyAdmin.password,
        role: "business_admin",
      },
    });
  }

  const existingSuper = await prisma.businessUser.findFirst({
    where: { businessId: null, username: superUsername },
  });
  if (existingSuper) {
    await prisma.businessUser.update({
      where: { id: existingSuper.id },
      data: { role: "superadmin", isActive: true },
    });
  } else {
    await prisma.businessUser.create({
      data: {
        username: superUsername,
        password: bcrypt.hashSync(superPassword, 10),
        role: "superadmin",
        isActive: true,
        businessId: null,
      },
    });
  }

  await prisma.subscription.upsert({
    where: { id: `${business.id}-default-subscription` },
    update: {},
    create: {
      id: `${business.id}-default-subscription`,
      businessId: business.id,
      monthlyAmount: 0,
      paymentStatus: "paid",
      currency: "PKR",
      notes: "Migrated from single-tenant data.",
    },
  });

  console.log("Multi-tenant bootstrap complete.");
  console.log(`Default business: ${business.name} (${business.slug})`);
  console.log(`Superadmin username: ${superUsername}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

