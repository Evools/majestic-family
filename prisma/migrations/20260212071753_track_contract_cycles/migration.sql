/*
  Warnings:

  - A unique constraint covering the columns `[userId,contractId,cycleNumber]` on the table `UserContract` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "currentCycle" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "UserContract" ADD COLUMN     "cycleNumber" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "UserContract_userId_contractId_cycleNumber_key" ON "UserContract"("userId", "contractId", "cycleNumber");
