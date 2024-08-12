-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "outsourcingCompanyId" TEXT,
ADD COLUMN     "outsourcingCost" DOUBLE PRECISION,
ADD COLUMN     "profit" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "OutsourcingCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "OutsourcingCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutsourcingCompany_name_key" ON "OutsourcingCompany"("name");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_outsourcingCompanyId_fkey" FOREIGN KEY ("outsourcingCompanyId") REFERENCES "OutsourcingCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
