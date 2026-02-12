-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "cooldownUntil" TIMESTAMP(3),
ADD COLUMN     "maxSlots" INTEGER NOT NULL DEFAULT 1;
