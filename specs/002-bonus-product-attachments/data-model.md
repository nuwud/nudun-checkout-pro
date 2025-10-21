# Data Model: Bonus Product Attachments

## Overview
Adds dedicated storage for merchant-configured bonus products tied to subscription messaging rules, plus idempotency tracking for inventory adjustments.

## Entities

### MessagingBonusAttachment
- **id**: string (UUID primary key)
- **configId**: string (FK -> existing messaging config)
- **ruleKey**: enum (`annual`, `quarterly`, `hero`, `upsell`) to tag which rule shows the attachment
- **productId**: string (Shopify GID)
- **variantId**: string | null (Shopify GID)
- **quantity**: int (>= 1)
- **valueSource**: enum (`price`, `custom`)
- **customValueCents**: int | null (stored in minor units when valueSource is `custom`)
- **locales**: JSON (shape `{ default: { title, body }, fr: {...} }`)
- **imageUrl**: string | null (cached featured image URL for checkout fallback)
- **updatedBy**: string (admin user identifier from session)
- **updatedAt**: DateTime (auto-updated)

**Indexes**:
- `idx_mba_config_rule` on `(configId, ruleKey)` for fast lookup in loaders
- `idx_mba_variant` on `(variantId)` to support hygiene queries when variant unpublished

### BonusInventoryAdjustment
- **id**: string (UUID primary key)
- **orderId**: string (Shopify order GID)
- **attachmentId**: string (FK -> MessagingBonusAttachment)
- **adjustedAt**: DateTime
- **status**: enum (`success`, `retrying`, `failed`)
- **attemptCount**: int (default 1)
- **lastError**: string | null (captured message)

**Indexes**:
- Unique index on `(orderId, attachmentId)` providing idempotency guarantee
- `idx_bia_status` on `(status)` to find retries quickly

## Relationships
- `MessagingConfig` (existing) 1 -> N `MessagingBonusAttachment`
- `MessagingBonusAttachment` 1 -> N `BonusInventoryAdjustment`

## Migrations
1. Add `MessagingBonusAttachment` table with foreign key cascading deletes when configs removed.
2. Add `BonusInventoryAdjustment` table with unique composite index for idempotency.
3. Update Prisma schema enums for `ruleKey` and `valueSource`.
4. Regenerate Prisma client via `npm run setup`.

## Data Flow Notes
- Admin save creates or updates attachment rows and upserts locale JSON.
- Loader joins attachments by `(configId, ruleKey)` and returns to admin UI and checkout config API.
- Webhook inserts into `BonusInventoryAdjustment` before attempting inventory change; retries update `status` and `attemptCount`.
- Reset-to-defaults clears attachments for config and optionally seeds baseline entries using known product IDs.

## Retention and Hygiene
- Nightly job (existing or new) should prune `BonusInventoryAdjustment` rows older than 90 days to keep table compact.
- Validation script flags attachments where referenced product or variant no longer exists; admin UI surfaces warning and prompts re-selection.
