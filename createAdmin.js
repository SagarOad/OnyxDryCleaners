const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function createAdmin() {
  const prisma = new PrismaClient();

  const hashedPassword = await bcrypt.hash('shazil@123', 10);

  await prisma.admin.create({
    data: {
      email: 'onyxdrycleaners', // Replace with your admin email
      password: hashedPassword,
    },
  });

  console.log('Admin created successfully.');
  prisma.$disconnect(); // Disconnect Prisma after the operation
}

createAdmin();
