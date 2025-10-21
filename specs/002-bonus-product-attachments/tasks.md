# Tasks: Bonus Product Attachments

**Input**: `/specs/002-bonus-product-attachments/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`

## Format: `[ID] [P?] [Story] Description`
- `[P]` indicates work that can run in parallel without merge conflicts.
- `[Story]` refers to user story labels (US1, US2, US3, US4) from the specification.

---

## Phase 0: Foundation (Blocking)

- [ ] T001 [US2] Update `prisma/schema.prisma` with `MessagingBonusAttachment` and `BonusInventoryAdjustment` models; run `npm run setup` to regenerate client.
- [ ] T002 [P][US2] Create Zod schemas in `app/services/messaging-bonus.server.ts` (or shared utils) for attachment payload validation.
- [ ] T003 [P][US2] Scaffold Admin GraphQL helper in `app/services/messaging-bonus.server.ts` to query products/variants per `contracts/bonus-attachments.graphql`.
- [ ] T004 [US2] Expose bonus attachments via existing config loader (`app/routes/app._index.tsx`) ensuring optional chaining and localization defaults.
- [ ] T005 [US2] Seed migration or script to insert baseline attachments for annual/quarterly presets (used by reset flow).

**Checkpoint**: Data structures and services exist; admin UI and extension work can proceed.

---

## Phase 1: User Story 2 - Merchant Configures Included Product (Priority P1)

**Goal**: Allow merchants to attach a bonus product to subscription messaging rules through the admin console.

- [ ] T010 [US2] Add route `app/routes/app.messaging.attachments.tsx` with loader/action using `authenticate.admin()` and new service layer.
- [ ] T011 [P][US2] Build `BonusAttachmentForm.tsx` (Polaris web components) with product picker modal, quantity/value fields, and localization inputs.
- [ ] T012 [P][US2] Implement optimistic form submission and success/error toasts using App Bridge helpers.
- [ ] T013 [US2] Persist attachments via service; ensure audit logging and reset-to-defaults action update `ConfigAuditLog`.
- [ ] T014 [P][US2] Add Vitest/RTL tests for form validation and loader/action behaviors in `tests/admin/bonus-attachments.test.tsx`.
- [ ] T015 [US2] Update admin console styles and responsive layout to display attachment preview card.
- [ ] T016 [P][US2] Document admin workflow in `docs/user-guides/bonus-attachments.md` with screenshots.

**Checkpoint**: Merchant can create, edit, and reset attachments; validation covered by tests.

---

## Phase 2: User Story 1 - Annual Subscription Shows Included Product Details (Priority P1)

**Goal**: Render bonus attachment card in checkout extension with accurate money formatting and fallbacks.

- [ ] T020 [US1] Introduce `extensions/nudun-messaging-engine/src/components/BonusAttachmentCard.jsx` with Preact JSX and optional chaining for Money objects.
- [ ] T021 [P][US1] Create `useBonusAttachment.js` hook sourcing attachment data from extension storage/API with graceful null return when absent.
- [ ] T022 [US1] Wire new component into `Checkout.jsx`, ensuring render completes under 100 ms and layout uses `<s-badge>`, `<s-image>`, `<s-text>`.
- [ ] T023 [P][US1] Add unit or harness tests (Vitest or existing mock) verifying rendering for annual vs quarterly subscriptions and removal when plan changes.
- [ ] T024 [US1] Update `locales/en.default.json` and `locales/fr.json` with new translation keys referenced by checkout UI.
- [ ] T025 [P][US1] Capture preview screenshots/GIFs for documentation and Shopify review evidence.

**Checkpoint**: Checkout messaging accurately displays attached bonus product details with localization-ready copy.

---

## Phase 3: User Story 3 - Inventory Attribution for Included Items (Priority P2)

**Goal**: Adjust inventory for included bonus products via webhook with idempotent retries.

- [ ] T030 [US3] Add `webhooks/orders-paid.tsx` (or extend existing orders webhook) to locate attachments, compute quantities, and call Admin API `inventoryAdjustQuantity`.
- [ ] T031 [P][US3] Implement retry helper with exponential backoff and persistence in `BonusInventoryAdjustment` table.
- [ ] T032 [US3] Record audit entries and debug logs for success/failure; expose status in admin console if feasible.
- [ ] T033 [P][US3] Write Vitest tests for webhook handler and retry service using mocked Shopify API responses.
- [ ] T034 [US3] Update operations runbook/test guide detailing manual replay steps and inventory verification.

**Checkpoint**: Inventory adjustments execute once per order + attachment, retries handled gracefully.

---

## Phase 4: User Story 4 - Localized Messaging & Fallbacks (Priority P2)

**Goal**: Ensure locale-specific copy and currency formatting in admin and checkout experiences.

- [ ] T040 [P][US4] Extend admin form to manage locale JSON (default + fr) with inline validation and fallback preview.
- [ ] T041 [US4] Apply `shopify.i18n.translate` and `shopify.i18n.formatCurrency` inside `BonusAttachmentCard` for runtime localization.
- [ ] T042 [P][US4] Add tests verifying fallback to English when locale missing and currency formatting matches order currency.
- [ ] T043 [US4] Coordinate translation review and update `locales/fr.json` placeholders with approved copy.

**Checkpoint**: Locales deliver consistent messaging; missing translations handled gracefully.

---

## Phase 5: Cross-Cutting Polish & Release

- [ ] T050 [P] Update `SHOPIFY-APPROVAL-CHECKLIST.md` and `IMPLEMENTATION-STATUS.md` with coverage for new feature.
- [ ] T051 [P] Ensure bundle size diff recorded (< 10 KB gzip) and document in plan/test logs.
- [ ] T052 Run full `npm run lint`, `npm run typecheck`, `npm run test`, and extension build; archive outputs in `docs/testing/TESTING-BONUS-ATTACHMENTS.md`.
- [ ] T053 [P] Finalize changelog entry and release notes referencing bonus attachment capability.
- [ ] T054 Conduct go/no-go review with product owner; capture sign-off in `docs/IMPLEMENTATION-STATUS.md`.

---

## Dependencies & Execution Order
- Phase 0 tasks block all other work; complete them before starting user stories.
- User stories prioritize P1 (US2 admin + US1 checkout) to deliver MVP; US3 and US4 can begin once foundational work is stable.
- Testing tasks marked `[P]` can run concurrently with related implementation once scaffolding exists.
- Cross-cutting polish waits until target stories green but should finish before deployment.

---

## Parallel Opportunities
- Multiple developers can share Phase 0 tasks T002 and T003 in parallel.
- After Phase 0, admin (US2) and checkout (US1) workstreams can proceed concurrently if service contract stable.
- Localization (US4) can overlap with extension work once translation fields exist.
- Webhook reliability (US3) can run in parallel after attachment schema available, but before launch ensure integration testing with admin + checkout.

---

## Implementation Strategy
1. Finish Phase 0 foundation to unblock downstream work.
2. Deliver MVP by completing User Stories 2 and 1; verify via admin save + checkout preview tests.
3. Layer on inventory tracking (US3) and localization polish (US4).
4. Close with cross-cutting polish tasks before release and app review submission.
