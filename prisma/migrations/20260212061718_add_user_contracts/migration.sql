-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "userContractId" TEXT;

-- CreateTable
CREATE TABLE "UserContract" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserContract_userId_status_idx" ON "UserContract"("userId", "status");

-- CreateIndex
CREATE INDEX "UserContract_contractId_idx" ON "UserContract"("contractId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userContractId_fkey" FOREIGN KEY ("userContractId") REFERENCES "UserContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContract" ADD CONSTRAINT "UserContract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContract" ADD CONSTRAINT "UserContract_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
