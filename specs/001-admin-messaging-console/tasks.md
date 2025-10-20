---
description: "Task list for Admin Messaging Console"
---

# Tasks: Admin Messaging Console

**Input**: Design documents from `/specs/001-admin-messaging-console/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit and component tests are included where they directly support acceptance criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure dependencies and documentation are ready before coding.

- [x] T001 Update `package.json` and lockfile to add `zod` runtime dependency and types.
- [x] T002 [P] Add admin console kickoff entry to `docs/IMPLEMENTATION-STATUS.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story work begins.

- [x] T003 Extend `prisma/schema.prisma` with messaging config, threshold, upsell, and audit models.
- [x] T004 [P] Generate `prisma/migrations/XXXX_add_messaging_console/` via `npx prisma migrate dev`.
- [x] T005 [P] Create baseline config seed in `app/data/default-messaging.json`.
- [x] T006 Implement service skeleton in `app/services/messaging.server.ts` (get/upsert/reset stubs).
- [x] T007 Scaffold authenticated API route in `app/routes/api.messaging-settings.ts` (loader/action placeholders).
- [x] T008 [P] Add `app/utils/validation.ts` with Zod schema placeholders wired to services.

**Checkpoint**: Database, services, and API scaffolding in place.

---

## Phase 3: User Story 1 - Configure Messaging Templates (Priority: P1) 🎯 MVP

**Goal**: Merchants can edit hero copy/tone and see it persist to checkout.

**Independent Test**: Update free-shipping banner text, save, refresh checkout; new copy renders within 60 seconds.

### Implementation & Tests

- [ ] T009 [P] [US1] Implement hero messaging Zod schema in `app/utils/validation.ts`.
- [ ] T010 [US1] Complete loader/action for hero messaging in `app/routes/app.messaging.tsx` using service layer.
- [ ] T011 [P] [US1] Build hero copy form in `app/routes/components/MessagingConsole.tsx` with Polaris web components.
- [ ] T012 [P] [US1] Update `extensions/nudun-messaging-engine/src/Checkout.jsx` to render hero copy from fetched config.
- [ ] T013 [P] [US1] Add hero localization strings to `extensions/nudun-messaging-engine/locales/en.default.json` and `extensions/nudun-messaging-engine/locales/fr.json`.
- [ ] T014 [US1] Write component test covering hero copy edits in `tests/admin/messagingConsole.test.tsx`.

**Checkpoint**: Hero messaging editable, persisted, and visible in checkout.

---

## Phase 4: User Story 2 - Control Upsell Logic (Priority: P1)

**Goal**: Merchants toggle upsells, adjust assumptions, and preview results.

**Independent Test**: Disable upsell and verify checkout hides banners; enable with new assumptions and preview reflects changes.

### Implementation & Tests

- [ ] T015 [P] [US2] Extend upsell validation schema in `app/utils/validation.ts`.
- [ ] T016 [US2] Persist upsell fields and toggles in `app/services/messaging.server.ts`.
- [ ] T017 [P] [US2] Implement `app/routes/components/UpsellEditor.tsx` with tone/percentage controls.
- [ ] T018 [US2] Wire upsell action handlers in `app/routes/app.messaging.tsx` including optimistic UI feedback.
- [ ] T019 [P] [US2] Adjust upsell rendering logic in `extensions/nudun-messaging-engine/src/Checkout.jsx` based on config.
- [ ] T020 [US2] Add upsell toggle tests to `tests/admin/messagingConsole.test.tsx`.

**Checkpoint**: Upsell logic controllable and reflected in checkout.

---

## Phase 5: User Story 3 - Manage Thresholds & Ordering (Priority: P2)

**Goal**: Merchants CRUD thresholds, set amounts, and reorder priority.

**Independent Test**: Change VIP threshold to $250, reorder tiers, save; checkout respects new ordering.

### Implementation & Tests

- [ ] T021 [P] [US3] Implement threshold CRUD operations in `app/services/messaging.server.ts` (create/update/delete/reorder).
- [ ] T022 [US3] Build drag-and-drop threshold UI in `app/routes/components/ThresholdEditor.tsx`.
- [ ] T023 [P] [US3] Extend action handlers in `app/routes/app.messaging.tsx` to process threshold mutations.
- [ ] T024 [US3] Serialize threshold data in `extensions/nudun-messaging-engine/src/utils/configAdapter.js` for runtime consumption.
- [ ] T025 [P] [US3] Add service-level tests for thresholds in `tests/admin/services/messaging.server.test.ts`.

**Checkpoint**: Threshold management fully functional with tests.

---

## Phase 6: User Story 4 - Live Preview & Sync Status (Priority: P2)

**Goal**: Merchants preview checkout output and confirm sync timestamps.

**Independent Test**: After saving settings, refresh preview; preview matches checkout and shows "Last synced" time.

### Implementation & Tests

- [ ] T026 [P] [US4] Implement config fetcher in `extensions/nudun-messaging-engine/src/config/merchantSettingsLoader.js` with caching.
- [ ] T027 [US4] Build `app/routes/components/PreviewPane.tsx` with mock-cart selectors and sync status banner.
- [ ] T028 [P] [US4] Surface last published timestamp and preview data in `app/routes/app.messaging.tsx` loader.
- [ ] T029 [US4] Add preview interaction test in `tests/admin/previewPane.test.tsx`.

**Checkpoint**: Preview reflects live config with clear sync status.

---

## Phase 7: User Story 5 - Audit & Reset Controls (Priority: P3)

**Goal**: Merchants audit changes and reset to defaults safely.

**Independent Test**: View change log, trigger reset; settings revert and checkout returns to baseline copy.

### Implementation & Tests

- [ ] T030 [P] [US5] Implement audit log queries and diff serialization in `app/services/messaging.server.ts`.
- [ ] T031 [US5] Render audit timeline and reset controls in `app/routes/components/MessagingConsole.tsx`.
- [ ] T032 [US5] Complete reset endpoint in `app/routes/api.messaging-settings.ts` including throttling.
- [ ] T033 [P] [US5] Expose audit listing API in `app/routes/app.messaging.tsx` with pagination.
- [ ] T034 [US5] Add audit/reset tests to `tests/admin/services/messaging.server.test.ts`.

**Checkpoint**: Audit trail and reset workflow operational.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, quality, and release readiness.

- [ ] T035 [P] Update merchant documentation in `docs/user-guides/admin-console.md` with screenshots.
- [ ] T036 Update roadmap entry in `docs/NEXT-STEPS.md` with release timeline.
- [ ] T037 [P] Add troubleshooting scenarios to `docs/troubleshooting/DEBUG-UPSELL.md` for messaging console.
- [ ] T038 Update `CHANGELOG.md` with feature summary under "Unreleased".
- [ ] T039 [P] Capture QA evidence and localization checklist in `docs/IMPLEMENTATION-STATUS.md`.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** must complete before foundational work.
- **Foundational (Phase 2)** depends on Setup and blocks all user stories; database schema, services, and API scaffolding must exist first.
- **User Story Phases (3–7)** each depend on Foundational completion. US1 and US2 (both P1) should be delivered first for MVP value; US3 and US4 (P2) can follow in parallel once their prerequisites are ready; US5 (P3) can start after service endpoints are stable.
- **Polish (Phase 8)** depends on the subset of user stories targeted for release.

Within each story:
- Validation/schema updates precede service and UI changes.
- Services must be ready before UI actions call them.
- Extension updates should occur after services can serve the new data.
- Tests should accompany or follow their corresponding implementation tasks before moving to the next story.

## Parallel Opportunities

- T002, T004, T005, and T008 can run parallel after dependencies finish because they touch distinct files.
- For US1, tasks T009, T011, T012, and T013 can proceed in parallel once loader work (T010) is defined.
- For US2–US4, editor components (T017, T022, T027) and extension integrations (T019, T024, T026) can be developed concurrently with their service updates if contracts are agreed.
- Testing tasks (T014, T020, T025, T029, T034) are marked independent and can execute once corresponding features land.
- Polish tasks (T035, T037, T039) can run parallel since they update different documentation assets.

## Implementation Strategy

### MVP Slice
1. Complete Phases 1–2 to establish schema, services, and API scaffolding.
2. Deliver Phase 3 (User Story 1) for editable hero messaging and checkout sync.
3. Optionally include Phase 4 (User Story 2) before releasing if upsell control is deemed critical.

### Incremental Delivery
- After MVP, ship User Story 2 to unlock upsell toggles.
- Next iterate on User Story 3 for threshold management.
- Follow with User Story 4 preview enhancements.
- Finish with User Story 5 audit/reset for comprehensive governance.

### Team Parallelization
- One engineer owns Prisma/services while another focuses on UI components per story.
- Extension engineer tackles Checkout/loader tasks in parallel with admin UI.
- QA/documentation support engages during Polish phase but can start capturing evidence once each story completes.

## Summary
- Generated file: `specs/001-admin-messaging-console/tasks.md`
- Total tasks: 39
- Task distribution: US1 (6), US2 (6), US3 (5), US4 (4), US5 (5), Setup/Foundational/Polish (13)
- Parallel opportunities highlighted for 16 tasks marked `[P]`
- Independent tests per story captured in phase descriptions plus dedicated test tasks (T014, T020, T025, T029, T034)
- Suggested MVP: Complete phases 1–3 (Hero messaging) before tackling later priorities
- Format validation: All tasks follow `- [ ] T### [P] [US#] Description with file path`
