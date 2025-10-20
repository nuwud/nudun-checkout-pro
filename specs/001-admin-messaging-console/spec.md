# Feature Specification: Admin Messaging Console

**Feature Branch**: `feature/admin-messaging-console`
**Created**: 2025-10-19
**Status**: Draft
**Input**: User description: "Create an embedded admin UI so merchants can control dynamic messaging, upsells, and thresholds from within the NUDUN Checkout Pro app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Messaging Templates (Priority: P1)

As a merchant admin, I can edit the copy, tone, and legal substitutions used by the checkout banners so the live experience reflects my brand and compliance needs.

**Why this priority**: Without editable copy the extension cannot be customized for real stores; messaging control is the core reason to open the app.

**Independent Test**: From the admin UI, change the free-shipping banner text, save, reload checkout; new copy renders and persists across sessions.

**Acceptance Scenarios**:

1. **Given** an authenticated merchant, **When** they update the "Free shipping met" heading and click save, **Then** the new heading appears in the checkout preview within 30 seconds.
2. **Given** a merchant sets the conservative tone preset, **When** they save, **Then** default copy switches to conservative wording for all thresholds.
3. **Given** a merchant clears optional fields, **When** they save, **Then** the checkout falls back to system defaults without errors.

---

### User Story 2 - Control Upsell Logic (Priority: P1)

As a merchant admin, I can enable or disable upsell banners, adjust upgrade assumptions, and preview the output so that my checkout only promotes offers I approve.

**Why this priority**: Upsell accuracy is critical; merchants need rapid control to avoid misleading customers.

**Independent Test**: Toggle upsell off, save; checkout extension hides upsell banners. Toggle back on and adjust assumptions; preview shows updated savings.

**Acceptance Scenarios**:

1. **Given** upsells are enabled, **When** the merchant switches the upsell toggle off and saves, **Then** upsell banners stop rendering in checkout.
2. **Given** the merchant edits the annual savings percentage to 22%, **When** they save, **Then** checkout recomputes savings using 22%.
3. **Given** the merchant clicks "Preview" for a sample quarterly plan, **When** the preview loads, **Then** the UI shows the expected banner with updated copy and amounts.

---

### User Story 3 - Manage Thresholds & Ordering (Priority: P2)

As a merchant admin, I can configure cart thresholds (amounts, rewards, priority order) and see which are active at a glance so I can align banners with promotions.

**Why this priority**: Threshold sequencing affects conversions; merchants must adjust without developer assistance.

**Independent Test**: Change the VIP threshold to $250, adjust priority, save; checkout banners reflect new thresholds.

**Acceptance Scenarios**:

1. **Given** existing thresholds, **When** the merchant edits the VIP amount to 250 and saves, **Then** the extension uses 25000 cents for the VIP threshold.
2. **Given** multiple thresholds, **When** the merchant drags the free gift tier above free shipping, **Then** the checkout shows the gift banner before shipping once met.

---

### User Story 4 - Live Preview & Sync Status (Priority: P2)

As a merchant admin, I can see a live preview that mirrors the checkout extension state and confirm when settings are synced so I know changes are live.

**Why this priority**: Merchants need confidence that saved changes affect checkout; preview ensures parity with Shopify customizer.

**Independent Test**: After saving settings, refresh preview; preview matches checkout extension output and shows "Last synced" timestamp.

**Acceptance Scenarios**:

1. **Given** a recent change, **When** the merchant opens the preview tab, **Then** it loads the extension with current settings using a mock cart context.
2. **Given** a sync completes, **When** the merchant checks status, **Then** they see a timestamp of last publish and any pending errors.

---

### User Story 5 - Audit & Reset Controls (Priority: P3)

As a merchant admin, I can audit previous configuration changes and reset to defaults so I can recover quickly from mistakes.

**Why this priority**: Provides safety net and compliance traceability.

**Independent Test**: View change log, click "Revert to defaults"; settings reset and checkout reverts to baseline copy.

**Acceptance Scenarios**:

1. **Given** change history, **When** the merchant clicks a log entry, **Then** they see who changed what and when.
2. **Given** a restore action, **When** the merchant confirms reset, **Then** all settings revert and checkout uses original defaults.

---

### Edge Cases

- What happens when Shopify admin API rate limits save operations?
- How does the system handle invalid currency inputs (e.g., threshold amount <= 0)?
- What if two admins edit settings simultaneously?
- How does preview behave when no subscription products exist? (Should show informative empty state.)
- What happens if upsell savings result in negative numbers?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admin UI MUST authenticate via `authenticate.admin()` before rendering controls.
- **FR-002**: System MUST allow merchants to edit and persist message templates (heading, body, tone, emoji toggles) per threshold state.
- **FR-003**: System MUST provide toggles and numeric inputs for upsell logic (enable flag, savings percentages, eligibility rules).
- **FR-004**: System MUST support CRUD for threshold tiers (add, edit amount, reward type, priority order, enable/disable).
- **FR-005**: System MUST surface a live preview using Polaris web components that renders sample banners using current config.
- **FR-006**: System MUST write configuration to persistent storage (Prisma) and expose an API for the extension to pull latest settings.
- **FR-007**: System MUST show save status, last sync timestamp, and error messages within the admin UI.
- **FR-008**: System MUST provide audit history with actor, timestamp, and diff summary for configuration changes.
- **FR-009**: System MUST allow merchants to restore defaults or revert to a previous snapshot.
- **FR-010**: System MUST validate inputs (e.g., positive currency, percentage between 0 and 100) and block invalid saves.
- **FR-011**: System MUST expose configuration via REST/GraphQL endpoint secured with session token for the checkout extension to consume.
- **FR-012**: System MUST update the Shopify customizer preview (or instruct merchant with copy) to ensure live extension reloads after changes.

### Key Entities *(include if feature involves data)*

- **MerchantMessagingConfig**: Stores per-merchant template copy, tone preset, threshold definitions, upsell parameters, and metadata (lastUpdated, updatedBy).
- **ThresholdSetting**: Child entity defining reward type, amount (Money type), message override, priority, enabled flag.
- **UpsellSetting**: Captures enable flag, savings percentages, eligible product handles, fallback copy.
- **AuditLogEntry**: Records change summaries (before/after), actor, timestamp, and affected keys.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Merchants can update messaging copy and see it live in checkout within 1 minute (p95) after saving.
- **SC-002**: Admin UI saves succeed 99% of the time under normal usage (<5 saves/minute).
- **SC-003**: At least 3 threshold tiers can be managed (add/edit/delete) without developer intervention.
- **SC-004**: Audit log displays a minimum of the last 20 changes with accurate timestamps.
- **SC-005**: Preview reflects saved configuration with <2 second render time and indicates last sync timestamp.
- **SC-006**: Checkout extension reads new settings on the next render without requiring a redeploy.
