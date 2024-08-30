-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
