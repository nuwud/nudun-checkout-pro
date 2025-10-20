# Feature Specification: Bonus Product Attachments for Messaging Console

**Feature Branch**: `feature/bonus-product-attachments`  
**Created**: 2025-10-20  
**Status**: Draft  
**Target Release**: Phase 2B – Subscription Intelligence  
**Constitutional Compliance**: ✅ Reviewed against v1.0.0 (Shopify Approval Checklist, API version 2025-10, Debugging Protocol)

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Annual Subscription Shows Included Product Details (Priority: P1)

As a **customer selecting an annual subscription**, I want to see that an included product (e.g., four premium glasses) comes with my order, complete with image and savings value, so that I understand the tangible benefit of upgrading.

**Independent Test**: Add annual subscription → checkout messaging renders image, product name, quantity, value savings, and localized copy describing included perk.

**Acceptance Scenarios**:
1. Annual subscription line item renders included product section with product image, badge "Included", quantity (4), value (formatted currency), and localized description string.
2. Savings value equals included quantity × attached product price (Money object handled per Constitution pattern) and formats per locale.
3. Changing subscription plan (annual ↔ quarterly) updates attached product details in <100 ms without reload.
4. Removing the subscription removes bonus product message immediately.
5. Accessibility: Screen reader announces "Included bonus: 4 Premium Glasses (value $120)" with descriptive alt text for the image.

---

### User Story 2 – Merchant Configures Included Product in Admin Console (Priority: P1)

As a **merchant**, I need to attach one or more bonus products to a subscription perk rule in the Messaging Console so that the checkout message stays accurate without editing theme code.

**Independent Test**: Open Messaging Console → edit annual subscription rule → attach product → save → reload console and confirm persistence → checkout reflects new attachment.

**Acceptance Scenarios**:
1. Admin form allows selecting Shopify product/variant via product picker modal limited to published products.
2. Form captures: productId, variantId (optional), displayName override, quantity included, value override (optional), and localized messaging copy.
3. Validation prevents zero/negative quantities and ensures either variant or product selected.
4. Saving updates Prisma-backed config; loader returns attached products for editing.
5. Reset to defaults clears attachments and reverts to starter presets.

---

### User Story 3 – Inventory Attribution for Included Items (Priority: P2)

Ops manager needs automatic tracking of included bonus items so warehouse counts remain accurate without treating them as sold inventory.

**Independent Test**: Customer completes checkout with annual subscription → webhook records inventory adjustment on attached product flagged as "included".

**Acceptance Scenarios**:
1. Checkout completion webhook detects attached bonus products and decrements inventory by included quantity using Shopify Admin API adjustments.
2. Adjustment tagged with metafield `nudun.includedBonus=true` (or order note attribute) to distinguish from paid sales.
3. If inventory tracking disabled for the product, webhook skips adjustment and logs warning (no failure).
4. Retry logic handles temporary API failures with exponential backoff and dead-letter audit entry.

---

### User Story 4 – Localized Messaging & Fallbacks (Priority: P2)

International customers must see bonus product copy in their locale to maintain trust and conversion rates.

**Independent Test**: Set locale to fr-CA → view checkout with bonus attachment → message displays French translation, fallback to English if missing.

**Acceptance Scenarios**:
1. Localization keys support per-locale title/body for each attachment; missing locale gracefully defaults to English.
2. Currency values formatted using `shopify.i18n.formatCurrency()` with order currency.
3. Layout responsive at 320 px width without overlap of image/value text.

---

### Edge Cases
- Subscription product without attached bonus → no bonus UI rendered (graceful null return).
- Attached product unpublished or deleted → admin console flags validation error and prevents deployment; checkout hides attachment.
- Multiple bonus products per subscription rule (future) → MVP limits to one attachment per rule; additional attachments backlog item.
- Checkout runs offline (Shop Pay) → message still renders from configuration; inventory adjustment deferred until webhook fires.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Admin console MUST allow merchants to attach a single bonus product (productId + optional variantId) to each subscription messaging rule.
- **FR-002**: Attached product metadata MUST include quantity, valueSource ("price" | "custom"), optional customValue, and localized description copy per locale.
- **FR-003**: Loader MUST fetch existing attachments and hydrate form state; saving MUST persist to Prisma model `MessagingBonusAttachment` linked to config thresholds/upsell rules.
- **FR-004**: Checkout extension MUST display attachment using Preact JSX for API 2025-10 with `<s-image>`, `<s-text>`, optional `<s-badge>`; fallback to text-only on image failure.
- **FR-005**: Savings value MUST derive from variant price (Money object) or custom override, formatted via `shopify.i18n.formatCurrency()`; optional chaining required on Money objects.
- **FR-006**: Attachment copy MUST support localization keys stored in `locales/*.json` and fallback to default locale.
- **FR-007**: Reset-to-defaults endpoint MUST remove attachments and seed baseline entries (annual=4 glasses, quarterly=1 glass) referencing configured product IDs.
- **FR-008**: On order completion webhook, system MUST record included product fulfillment via Admin API inventoryAdjust or order metafield update tagged as `included_bonus`.
- **FR-009**: Inventory adjustments MUST be idempotent per order (use orderId + attachmentId composite key).
- **FR-010**: Audit log MUST capture admin attachment changes and webhook adjustments (existing `ConfigAuditLog`).
- **FR-011**: UI MUST maintain performance budget (<100 ms new render) and mobile responsiveness per constitution.
- **FR-012**: Attachment data MUST be validated with Zod on save (non-empty productId, quantity ≥1, valid Money format).

### Data Model Updates
- Extend Prisma schema with `MessagingBonusAttachment` table: id (UUID), configId (FK), ruleKey (hero|threshold|upsell scoped), productId, variantId nullable, quantity int, valueSource enum, customValueCents nullable, locales JSONB, imageUrl cache, updatedAt.
- Update `MessagingConfigResponse` to include `bonusAttachments` array keyed by rule.

## Success Criteria *(mandatory)*
- **SC-001**: Admin can attach bonus product and see persisted data on reload (tested in dev store).
- **SC-002**: Checkout extension shows bonus info (image, quantity, value) for annual subscription within <100 ms render budget.
- **SC-003**: Inventory webhook adjusts stock with `included_bonus` tag in 100% of successful orders; failures logged and retried (max 3 attempts).
- **SC-004**: Localization coverage for English and French verified; unsupported locales fallback gracefully.
- **SC-005**: No Shopify approval violations (optional chaining, error boundaries, accessibility) detected in lint/typecheck/App Review checklist.
- **SC-006**: Bundle size remains <50 KB; no regression in existing messaging features.

## Technical Context *(informative)*
- Reuse Messaging Console architecture (React Router loader/action with Prisma services).
- Extend services in `app/services/messaging.server.ts` and `app/routes/app._index.tsx` form state.
- Checkout UI extension already uses Preact; add `BonusAttachmentCard` component reading from `shopify.extension.storage` or metafield endpoint.
- Inventory handling likely extends existing webhook route `webhooks.app.scopes_update.tsx` or creates new e.g., `webhooks.orders.paid`.

## Risks & Mitigations
- **RISK-A**: Shopify Admin API write limits hit during bulk adjustments. *Mitigation*: Queue adjustments with batch throttle, use bulk mutation when possible.
- **RISK-B**: Product picker adds dependency on Shopify Admin GraphQL. *Mitigation*: Use existing authenticated admin loader; cache results.
- **RISK-C**: Merchants misconfigure product/variant (deleted). *Mitigation*: Validate on save + nightly hygiene job.

## Open Questions
1. Should merchants attach multiple bonus products per plan? (MVP says single, confirm roadmap.)
2. Should savings value derive from compare-at price vs. regular price? Need business input.
3. Which webhook event best fits inventory logging (`orders/paid` vs `fulfillments/create`)?
4. Do we need analytics events (impression/click) for bonus attachments now or in Phase 3?

## Next Steps
1. Run `/speckit.plan bonus-product-attachments` to create technical plan keyed to this spec once approved.
2. Review plan against `SHOPIFY-APPROVAL-CHECKLIST.md`.
3. Generate tasks via `/speckit.tasks bonus-product-attachments` and execute through `/speckit.implement`.
