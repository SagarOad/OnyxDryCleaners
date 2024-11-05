/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `existingId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Made the column `service` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "existingId" INTEGER NOT NULL,
ALTER COLUMN "service" SET NOT NULL;

-- CreateTable
CREATE TABLE "ExistingCustomers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExistingCustomers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExistingCustomers_value_key" ON "ExistingCustomers"("value");
