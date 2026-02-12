/*
  Warnings:

  - A unique constraint covering the columns `[staticId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "staticId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_staticId_key" ON "User"("staticId");
