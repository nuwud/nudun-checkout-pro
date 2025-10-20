# Data Model: Admin Messaging Console

_Last updated: 2025-10-19_

## Goals
- Persist merchant-configurable messaging without redeploying checkout extension.
- Track historical changes for audit/export while controlling growth.
- Ensure schema portable from SQLite (dev) to PostgreSQL (prod ready).

## Prisma Schema Changes
```prisma
model MerchantMessagingConfig {
  id                Int                    @id @default(autoincrement())
  shopDomain        String                 @unique
  heroHeadline      String                 @db.VarChar(255)
  heroBody          String                 @db.VarChar(2000)
  currencyCode      String                 @db.VarChar(8)
  defaultTone       String                 @db.VarChar(32)
  lastPublishedAt   DateTime?
  thresholds        ThresholdSetting[]
  upsellSettings    UpsellSetting[]
  auditEntries      ConfigAuditLog[]
  createdAt         DateTime               @default(now())
  updatedAt         DateTime               @updatedAt
}

model ThresholdSetting {
  id             Int      @id @default(autoincrement())
  configId       Int
  labelKey       String   @db.VarChar(64) // translation key reference
  amount         Decimal  @db.Decimal(10, 2)
  tone           String   @db.VarChar(32)
  priority       Int      @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  config MerchantMessagingConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  @@index([configId])
}

model UpsellSetting {
  id             Int      @id @default(autoincrement())
  configId       Int
  title          String   @db.VarChar(255)
  body           String   @db.VarChar(2000)
  targetProduct  String?  @db.VarChar(96)
  discountCode   String?  @db.VarChar(32)
  isEnabled      Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  config MerchantMessagingConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  @@index([configId])
}

model ConfigAuditLog {
  id           Int      @id @default(autoincrement())
  configId     Int
  actorShop    String   @db.VarChar(255)
  actorEmail   String?  @db.VarChar(255)
  action       String   @db.VarChar(64)
  diff         Json
  createdAt    DateTime @default(now())

  config MerchantMessagingConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  @@index([configId, createdAt])
}
```

## Relationships
- `MerchantMessagingConfig` is parent record per shop domain.
- `ThresholdSetting` and `UpsellSetting` reference `configId`; cascade delete ensures clean teardown on uninstall.
- `ConfigAuditLog` attaches to config and stores JSON diff for each mutation (create/update/reset).

## Retention & Maintenance
- Limit audit entries to latest 20 per shop. Implement cleanup function in service layer after every write.
- Provide manual reset endpoint that truncates thresholds/upsells and appends audit entry noting reset.
- Future enhancement: archive audit logs to external storage if merchants demand longer retention.

## Migrations
1. Update `prisma/schema.prisma` with models above.  
2. Run `npx prisma migrate dev --name add_messaging_console`.  
3. Update `scripts/setup` to ensure `npm run setup` applies migration for prod.  
4. Document rollback: `prisma migrate resolve --rolled-back add_messaging_console` + removing tables.

## Data Access Layer
- Add `app/services/messaging.server.ts` with functions: `getConfigByShop`, `upsertConfig`, `publishConfig`, `listAuditEntries`, `resetConfig`.
- Services should return plain objects typed via `@shopify/shopify-app` types + Zod inference for shared validation.
- Ensure decimals converted to string when returning to frontend to avoid floating errors.

## Validation Rules
- Threshold `amount` ≥ 0.00 and ≤ 99999.99; allow two decimal places.
- `priority` integer between 0-9 to keep evaluation order manageable.
- `heroBody`, `upsell body` sanitized to strip `<script>` or inline event handlers.
- Audit `diff` JSON limited to 5 KB payload to avoid DB bloat.

## Publishing Strategy
- After successful save, service serializes config into normalized structure (sorted by priority) and stores copy in `MerchantMessagingConfig` row (`lastPublishedAt`).
- Checkout extension fetches latest config via REST endpoint calling `getConfigByShop`.
- Consider caching serialized JSON in memory (per-process) with 60-second TTL to minimize DB hits under load.
