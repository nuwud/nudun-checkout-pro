# Research Log: Bonus Product Attachments

## Summary
Ground truth gathered for product selection, savings calculations, localization, and inventory attribution so the plan can move forward without unknowns. All findings keep us compliant with the constitution and Shopify review expectations.

## Topic 1: Product Selection and Data Source
- **Decision**: Use Shopify Admin GraphQL `products(first:10)` with `@inContext` to populate the product picker, then persist only `productId` and `variantId`.
- **Rationale**: GraphQL response already aligns with existing admin infrastructure, supports pagination, and provides price, title, and featured image needed for previews.
- **Alternatives considered**: REST Admin endpoints were rejected because they require multiple calls per selection, increasing rate limit pressure and code complexity.

## Topic 2: Savings Value Calculation
- **Decision**: Default savings calculation uses variant `price.amount`; allow custom override stored as Money-like struct (`valueSource = "custom"`).
- **Rationale**: Using the primary variant price keeps the UI accurate without extra queries. Overrides give marketing flexibility for compare-at promotions.
- **Alternatives considered**: Automatically reading `compareAtPrice` was rejected because not all products set it and it could mislead customers when missing.

## Topic 3: Webhook Event for Inventory Attribution
- **Decision**: Listen to `orders/paid` webhook to deduct inventory for included items.
- **Rationale**: Event fires once payment captured and before fulfillment, providing reliable timing while ensuring inventory reflects promised freebies.
- **Alternatives considered**: `fulfillments/create` fires too late (after warehouse processing) and risks double adjustments if partial fulfillments occur.

## Topic 4: Idempotency Guard Strategy
- **Decision**: Store `(orderId, attachmentId)` composite key in new table to prevent duplicate adjustments on retries.
- **Rationale**: Webhooks can replay; storing the key lets us short-circuit repeated adjustments without relying on Shopify headers alone.
- **Alternatives considered**: Hashing payload or storing metafield flag on order was rejected because order metafields are eventually consistent and not guaranteed during retries.

## Topic 5: Localization Delivery
- **Decision**: Attachment copy lives inside Prisma record as JSON with `default` plus per-locale keys; checkout extension calls `shopify.i18n.translate` with fallback.
- **Rationale**: Mirrors existing messaging engine design, keeps copy merchant-editable, and ensures future locales only require JSON updates.
- **Alternatives considered**: Storing translations in extension `locales/*.json` only was rejected because merchants cannot edit those files without redeploying.
