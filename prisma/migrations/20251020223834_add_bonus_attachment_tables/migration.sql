-- CreateTable
CREATE TABLE "MessagingBonusAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configId" INTEGER NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "valueSource" TEXT NOT NULL DEFAULT 'price',
    "customValueCents" INTEGER,
    "locales" JSONB NOT NULL,
    "imageUrl" TEXT,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MessagingBonusAttachment_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MerchantMessagingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BonusInventoryAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "adjustedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'retrying',
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BonusInventoryAdjustment_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "MessagingBonusAttachment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MessagingBonusAttachment_configId_ruleKey_idx" ON "MessagingBonusAttachment"("configId", "ruleKey");

-- CreateIndex
CREATE INDEX "MessagingBonusAttachment_variantId_idx" ON "MessagingBonusAttachment"("variantId");

-- CreateIndex
CREATE INDEX "BonusInventoryAdjustment_status_idx" ON "BonusInventoryAdjustment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BonusInventoryAdjustment_orderId_attachmentId_key" ON "BonusInventoryAdjustment"("orderId", "attachmentId");
