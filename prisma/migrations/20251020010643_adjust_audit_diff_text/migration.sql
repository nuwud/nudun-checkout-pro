-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConfigAuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "configId" INTEGER NOT NULL,
    "actorShop" TEXT NOT NULL,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "diff" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConfigAuditLog_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MerchantMessagingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ConfigAuditLog" ("action", "actorEmail", "actorShop", "configId", "createdAt", "diff", "id") SELECT "action", "actorEmail", "actorShop", "configId", "createdAt", "diff", "id" FROM "ConfigAuditLog";
DROP TABLE "ConfigAuditLog";
ALTER TABLE "new_ConfigAuditLog" RENAME TO "ConfigAuditLog";
CREATE INDEX "ConfigAuditLog_configId_createdAt_idx" ON "ConfigAuditLog"("configId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
