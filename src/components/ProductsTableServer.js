import prisma from "../../lib/prisma";
import ProductsTableClient from "./ProductsTableClient";

async function fetchProducts() {
  try {
    return await prisma.product.findMany({
      select: {
        id: true,
        label: true,
        value: true,
        price: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ProductTableServer() {
  const products = await fetchProducts();
  return <ProductsTableClient initialData={products} />;
}