/*
  Warnings:

  - Added the required column `messageJson` to the `ThresholdSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bodyJson` to the `UpsellSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleJson` to the `UpsellSetting` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ThresholdSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "configId" INTEGER NOT NULL,
    "labelKey" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "tone" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "messageJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ThresholdSetting_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MerchantMessagingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ThresholdSetting" ("amountCents", "configId", "createdAt", "id", "isActive", "labelKey", "priority", "tone", "updatedAt") SELECT "amountCents", "configId", "createdAt", "id", "isActive", "labelKey", "priority", "tone", "updatedAt" FROM "ThresholdSetting";
DROP TABLE "ThresholdSetting";
ALTER TABLE "new_ThresholdSetting" RENAME TO "ThresholdSetting";
CREATE INDEX "ThresholdSetting_configId_idx" ON "ThresholdSetting"("configId");
CREATE TABLE "new_UpsellSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "configId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "titleJson" TEXT NOT NULL,
    "bodyJson" TEXT NOT NULL,
    "targetProduct" TEXT,
    "discountCode" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UpsellSetting_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MerchantMessagingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UpsellSetting" ("body", "configId", "createdAt", "discountCode", "id", "isEnabled", "targetProduct", "title", "updatedAt") SELECT "body", "configId", "createdAt", "discountCode", "id", "isEnabled", "targetProduct", "title", "updatedAt" FROM "UpsellSetting";
DROP TABLE "UpsellSetting";
ALTER TABLE "new_UpsellSetting" RENAME TO "UpsellSetting";
CREATE INDEX "UpsellSetting_configId_idx" ON "UpsellSetting"("configId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
