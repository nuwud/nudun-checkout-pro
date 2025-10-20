-- CreateTable
CREATE TABLE "MerchantMessagingConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopDomain" TEXT NOT NULL,
    "heroHeadline" TEXT NOT NULL,
    "heroBody" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "defaultTone" TEXT NOT NULL,
    "lastPublishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ThresholdSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "configId" INTEGER NOT NULL,
    "labelKey" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "tone" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ThresholdSetting_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MerchantMessagingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UpsellSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "configId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "targetProduct" TEXT,
    "discountCode" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UpsellSetting_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MerchantMessagingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfigAuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "configId" INTEGER NOT NULL,
    "actorShop" TEXT NOT NULL,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "diff" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConfigAuditLog_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MerchantMessagingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantMessagingConfig_shopDomain_key" ON "MerchantMessagingConfig"("shopDomain");

-- CreateIndex
CREATE INDEX "ThresholdSetting_configId_idx" ON "ThresholdSetting"("configId");

-- CreateIndex
CREATE INDEX "UpsellSetting_configId_idx" ON "UpsellSetting"("configId");

-- CreateIndex
CREATE INDEX "ConfigAuditLog_configId_createdAt_idx" ON "ConfigAuditLog"("configId", "createdAt");
