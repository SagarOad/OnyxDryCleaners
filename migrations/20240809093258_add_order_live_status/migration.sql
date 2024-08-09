-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "liveStatusId" TEXT;

-- CreateTable
CREATE TABLE "OrderLiveStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "OrderLiveStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderLiveStatus_status_key" ON "OrderLiveStatus"("status");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_liveStatusId_fkey" FOREIGN KEY ("liveStatusId") REFERENCES "OrderLiveStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
