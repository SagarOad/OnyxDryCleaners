// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  { label: "Suit (Cotton/Wash & Wear)", value: "Suit (Cotton/Wash & Wear)", price: 200 },
  { label: "Suit (Boski)", value: "Suit (Boski)", price: 400 },
  { label: "Suit (Curndi)", value: "Suit (Curndi)", price: 200 },
  { label: "Pent", value: "Pent", price: 100 },
  { label: "Shirt", value: "Shirt", price: 100 },
  { label: "T-Shirt", value: "T-Shirt", price: 100 },
  { label: "Baniyan-Vest", value: "Baniyan-Vest", price: 60 },
  { label: "Towel", value: "Towel", price: 80 },
  { label: "Coat (Dry Cleaning)", value: "Coat (Dry Cleaning)", price: 450 },
  { label: "Waist Coat", value: "Waist Coat", price: 300 },
  { label: "Jacket", value: "Jacket", price: 300 },
  { label: "Bed Sheet (Single/Double)", value: "Bed Sheet (Single/Double)", price: 130 },
  { label: "Pillow Cover (One Pcs)", value: "Pillow Cover (One Pcs)", price: 100 },
  { label: "Blanket (Anti Bacterial Cleaning)", value: "Blanket (Anti Bacterial Cleaning)", price: 400 },
  { label: "Razai- Comforter", value: "Razai- Comforter", price: 400 },
  { label: "Sweater", value: "Sweater", price: 230 },
  { label: "Shawl", value: "Shawl", price: 230 },
  { label: "Carpet (4x8)", value: "Carpet (4x8)", price: 500 },
  { label: "Suit (Claff Iron)", value: "Suit (Claff Iron)", price: 150 },
  { label: "Suit (Wash & Ware Iron)", value: "Suit (Wash & Ware Iron)", price: 100 },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { value: product.value },
      update: {},
      create: {
        label: product.label,
        value: product.value,
        price: product.price,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
