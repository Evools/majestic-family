-- CreateTable
CREATE TABLE "DashboardSettings" (
    "id" TEXT NOT NULL,
    "bonusActive" BOOLEAN NOT NULL DEFAULT false,
    "bonusTitle" TEXT,
    "bonusDescription" TEXT,
    "familyBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goalName" TEXT,
    "goalTarget" DOUBLE PRECISION,
    "goalCurrent" DOUBLE PRECISION,
    "familyLevel" INTEGER NOT NULL DEFAULT 1,
    "familyXP" INTEGER NOT NULL DEFAULT 0,
    "familyXPRequired" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardSettings_pkey" PRIMARY KEY ("id")
);
