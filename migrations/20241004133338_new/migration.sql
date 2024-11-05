/*
  Warnings:

  - You are about to drop the column `value` on the `ExistingCustomers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `ExistingCustomers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `service` to the `ExistingCustomers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ExistingCustomers_value_key";

-- AlterTable
ALTER TABLE "ExistingCustomers" DROP COLUMN "value",
ADD COLUMN     "service" TEXT NOT NULL,
ALTER COLUMN "contact" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ExistingCustomers_name_key" ON "ExistingCustomers"("name");
