-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "familyName" TEXT NOT NULL DEFAULT 'Shelby Family',
    "familyDescription" TEXT,
    "familyLogoUrl" TEXT,
    "userSharePercent" INTEGER NOT NULL DEFAULT 60,
    "familySharePercent" INTEGER NOT NULL DEFAULT 40,
    "minWithdrawal" INTEGER NOT NULL DEFAULT 10000,
    "contractCooldownHours" INTEGER NOT NULL DEFAULT 24,
    "autoApproveReports" BOOLEAN NOT NULL DEFAULT false,
    "xpMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "baseXPRequired" INTEGER NOT NULL DEFAULT 1000,
    "discordWebhook" TEXT,
    "notifyNewReports" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
