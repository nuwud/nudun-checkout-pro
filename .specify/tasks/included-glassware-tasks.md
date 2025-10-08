# Tasks: Included Glassware Messaging (Dynamic Messaging Engine v1.0)

**Branch**: `feature/included-glassware` | **Date**: 2025-10-07  
**Input**: 
- Design from [included-glassware-plan.md](../plans/included-glassware-plan.md)
- Spec from [included-glassware.md](../specs/included-glassware.md)

**Prerequisites**: 
- ✅ Constitutional compliance verified (v1.0.0)
- ✅ Implementation plan approved
- ✅ Extension API 2025-10 verified
- ✅ Development environment ready

**Enhanced Requirements** (from `/speckit.tasks` input):
1. ✅ **Product title detection**: Already planned (keyword-based)
2. 🎯 **NEW: Display glass value from store**: Fetch glass product price, show "($X value)"
3. 🎯 **NEW: Prevent duplicate purchases**: Clear messaging that glasses are included

---

## Task Organization

Tasks are grouped by **user story priority** to enable incremental delivery:
- **Phase 1-2**: Foundation (shared infrastructure)
- **Phase 3**: User Story 1 (P1) - Quarterly subscribers see glass inclusion **with value**
- **Phase 4**: User Story 2 (P2) - Annual subscribers see 4 glasses **with total value**
- **Phase 5**: User Story 3 (P3) - Localization support
- **Phase 6**: User Story 4 (P3) - Accessibility compliance
- **Phase 7**: Polish & documentation

**Format**: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story tag (US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize test infrastructure and development tools

**Duration**: 1 hour

- [ ] **T001** [P] Add Vitest test framework to `extensions/nudun-messaging-engine/package.json`
  - Dependencies: `vitest@^0.34.0`, `@testing-library/preact@^3.2.3`, `jsdom@^22.0.0`
  - Add scripts: `"test": "vitest"`, `"test:coverage": "vitest --coverage"`
  - **DOD**: `npm test` runs successfully (0 tests initially)
  - **Commit**: `chore: Add Vitest testing infrastructure`

- [ ] **T002** [P] Create `__tests__/` directory structure
  - Create: `extensions/nudun-messaging-engine/__tests__/.gitkeep`
  - **DOD**: Directory exists and tracked by git
  - **Commit**: Include with T001 (chore commit)

- [ ] **T003** [P] Create stub test configuration
  - File: `extensions/nudun-messaging-engine/vitest.config.js`
  - Content: Configure jsdom environment, test patterns
  - **DOD**: `npm test` loads config, finds no tests (expected)
  - **Commit**: Include with T001 (chore commit)

**Checkpoint**: ✅ Test infrastructure ready, `npm test` command works

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that ALL user stories depend on

**Duration**: 3 hours

**⚠️ CRITICAL**: No user story implementation can begin until this phase completes

### Subscription Detection Foundation

- [ ] **T004** Create subscription detection utility
  - File: `extensions/nudun-messaging-engine/src/utils/subscriptionDetection.js`
  - Implement: `detectSubscription(lineItem)` function
  - Logic: 
    - Case-insensitive keyword search: "quarterly", "annual", "subscription"
    - Null safety (return safe defaults for null/undefined input)
    - Return: `{ isSubscription, glassCount, subscriptionType }`
    - Priority: "annual" > "quarterly" > "subscription" (generic)
  - JSDoc: Full documentation with examples
  - **DOD**: Function exists, exports correctly, has JSDoc
  - **Commit**: `feat: Add subscription detection utility`
  - **Time**: 1 hour

- [ ] **T005** Write unit tests for subscription detection (TDD - tests FAIL initially)
  - File: `extensions/nudun-messaging-engine/__tests__/subscriptionDetection.test.js`
  - Test cases (12+):
    - ✅ Detects "quarterly" (lowercase, uppercase, mixed case)
    - ✅ Detects "annual" (returns glassCount: 4)
    - ✅ Detects generic "subscription" (defaults to 1 glass)
    - ✅ Returns false for non-subscription products
    - ✅ Handles null/undefined line items
    - ✅ Handles missing title property
    - ✅ Handles non-string title (e.g., number)
    - ✅ Prioritizes "annual" over "quarterly" when both present
  - **DOD**: All 12 tests PASS, 100% coverage for detection utility
  - **Commit**: `test: Add unit tests for subscription detection`
  - **Time**: 1 hour

### Glass Value Fetching Foundation (NEW ENHANCEMENT 🎯)

- [ ] **T006** [P] Create glass product lookup utility
  - File: `extensions/nudun-messaging-engine/src/utils/glassProductLookup.js`
  - Implement: `getGlassProductPrice()` function
  - Logic:
    - Use `shopify.query()` to fetch glass product by handle/SKU
    - Handle: "premium-glass" (configurable via constant)
    - Extract price from product variant
    - Return: `{ price: { amount: "25.00", currencyCode: "USD" }, found: true }`
    - Null safety: Return `{ price: null, found: false }` if product not found
    - Cache result (avoid repeated queries)
  - JSDoc: Document query approach, caching strategy
  - **DOD**: Function fetches glass product price from Shopify
  - **Commit**: `feat: Add glass product price lookup utility`
  - **Time**: 1 hour
  - **Note**: This enables showing "($25 value)" in messaging

**Checkpoint**: ✅ Foundation ready - Detection works, price lookup works, tests pass

---

## Phase 3: User Story 1 - Quarterly Subscriber Sees Glass Inclusion with Value (Priority: P1) 🎯 MVP

**Goal**: Customer adding quarterly subscription sees "Includes **1** premium glass ($25 value)" with image

**Independent Test**: Add product titled "Coffee - Quarterly" to cart → verify message with price appears in checkout

**Duration**: 5 hours

### Tests for User Story 1 (Write FIRST - they should FAIL)

- [ ] **T007** [P] [US1] Component tests for GlasswareMessage (TDD)
  - File: `extensions/nudun-messaging-engine/__tests__/GlasswareMessage.test.jsx`
  - Test cases (10+):
    - ✅ Renders singular message for 1 glass
    - ✅ Renders price when glassPrice provided: "Includes **1** premium glass ($25.00 value)"
    - ✅ Renders without price when glassPrice is null: "Includes **1** premium glass"
    - ✅ Renders image with correct alt text
    - ✅ Image has 50×50 dimensions
    - ✅ Handles image load error (fallback to text-only)
    - ✅ Returns null for glassCount: 0
    - ✅ Uses correct localization key (glasswareIncludesSingular)
    - ✅ Formats currency correctly ($25.00, not $25)
    - ✅ Shows "value" text when price is present
  - Mock: `shopify.i18n.translate()` function
  - **DOD**: All tests FAIL initially (component doesn't exist yet)
  - **Commit**: `test: Add component tests for GlasswareMessage`
  - **Time**: 1 hour

### Localization for User Story 1

- [ ] **T008** [P] [US1] Add English localization keys
  - File: `extensions/nudun-messaging-engine/locales/en.default.json`
  - Add keys:
    - `"glasswareIncludesSingular": "Includes **{{count}}** premium glass"`
    - `"glasswareIncludesSingularWithValue": "Includes **{{count}}** premium glass ({{price}} value)"`
    - `"glasswareImageAlt": "Premium glass included"`
  - **DOD**: Keys added, JSON valid
  - **Commit**: `i18n: Add English glassware messaging keys`
  - **Time**: 15 minutes

- [ ] **T009** [P] [US1] Add French localization keys
  - File: `extensions/nudun-messaging-engine/locales/fr.json`
  - Add keys:
    - `"glasswareIncludesSingular": "Comprend **{{count}}** verre premium"`
    - `"glasswareIncludesSingularWithValue": "Comprend **{{count}}** verre premium (valeur de {{price}})"`
    - `"glasswareImageAlt": "Verre premium inclus"`
  - **DOD**: Keys added, JSON valid, reviewed by native speaker (if available)
  - **Commit**: `i18n: Add French glassware messaging keys`
  - **Time**: 15 minutes

### Implementation for User Story 1

- [ ] **T010** [US1] Create GlasswareMessage component
  - File: `extensions/nudun-messaging-engine/src/components/GlasswareMessage.jsx`
  - Props: `{ glassCount, glassPrice, locale }`
  - Logic:
    - Return `null` if `glassCount === 0`
    - Determine singular vs plural key based on `glassCount`
    - If `glassPrice` provided: Use `glasswareIncludesSingularWithValue` key
    - If `glassPrice` is `null`: Use `glasswareIncludesSingular` key (no value shown)
    - Format price: `shopify.i18n.formatCurrency(glassPrice.amount, glassPrice.currencyCode)`
    - Render: `<s-block-stack spacing="tight">` with `<s-image>` + `<s-text>`
    - Image fallback: `onError` handler hides image, shows text-only
    - Alt text: Use `glasswareImageAlt` localization key
  - JSDoc: Document props, behavior, fallback strategy
  - **DOD**: Component renders correctly, all T007 tests PASS
  - **Commit**: `feat: Add GlasswareMessage component with value display`
  - **Time**: 2 hours

- [ ] **T011** [US1] Integrate into main extension for checkout
  - File: `extensions/nudun-messaging-engine/src/Checkout.jsx` (MODIFY)
  - Import: `{ detectSubscription }` from utils
  - Import: `{ getGlassProductPrice }` from utils
  - Import: `{ GlasswareMessage }` from components
  - Logic:
    - Keep existing banner (backward compatibility)
    - Add below banner: Loop through `shopify.lines.value`
    - For each line: Call `detectSubscription(line)`
    - If subscription detected: Fetch glass price with `getGlassProductPrice()`
    - Render: `<GlasswareMessage glassCount={...} glassPrice={...} />`
  - **DOD**: Quarterly subscriptions show message with price in checkout
  - **Commit**: `feat: Integrate glassware messaging into checkout extension`
  - **Time**: 1.5 hours

**Checkpoint**: ✅ US1 Complete - Quarterly subscribers see "Includes **1** premium glass ($25 value)" in checkout

---

## Phase 4: User Story 2 - Annual Subscriber Sees 4 Glasses with Total Value (Priority: P2)

**Goal**: Customer adding annual subscription sees "Includes **4** premium glasses ($100 value)" 

**Independent Test**: Add product titled "Coffee - Annual" to cart → verify message shows 4 glasses with 4× price

**Duration**: 2 hours

### Localization for User Story 2

- [ ] **T012** [P] [US2] Add plural localization keys (English)
  - File: `extensions/nudun-messaging-engine/locales/en.default.json`
  - Add keys:
    - `"glasswareIncludesPlural": "Includes **{{count}}** premium glasses"`
    - `"glasswareIncludesPluralWithValue": "Includes **{{count}}** premium glasses ({{price}} value)"`
  - **DOD**: Keys added, JSON valid
  - **Commit**: `i18n: Add English plural glassware keys`
  - **Time**: 10 minutes

- [ ] **T013** [P] [US2] Add plural localization keys (French)
  - File: `extensions/nudun-messaging-engine/locales/fr.json`
  - Add keys:
    - `"glasswareIncludesPlural": "Comprend **{{count}}** verres premium"`
    - `"glasswareIncludesPluralWithValue": "Comprend **{{count}}** verres premium (valeur de {{price}})"`
  - **DOD**: Keys added, JSON valid
  - **Commit**: `i18n: Add French plural glassware keys`
  - **Time**: 10 minutes

### Implementation for User Story 2

- [ ] **T014** [US2] Update GlasswareMessage component for plural support
  - File: `extensions/nudun-messaging-engine/src/components/GlasswareMessage.jsx` (MODIFY)
  - Logic changes:
    - If `glassCount === 1`: Use singular keys
    - If `glassCount > 1`: Use plural keys
    - Calculate total value: `glassPrice.amount * glassCount`
    - Format total: `shopify.i18n.formatCurrency(totalValue, glassPrice.currencyCode)`
  - **DOD**: Component handles both singular and plural correctly
  - **Commit**: `feat: Add plural support to GlasswareMessage component`
  - **Time**: 45 minutes

- [ ] **T015** [P] [US2] Add component tests for plural rendering
  - File: `extensions/nudun-messaging-engine/__tests__/GlasswareMessage.test.jsx` (MODIFY)
  - Add test cases:
    - ✅ Renders plural message for 4 glasses
    - ✅ Calculates total value correctly (4 × $25 = $100)
    - ✅ Uses plural localization key (glasswareIncludesPlural)
    - ✅ Renders "glasses" (plural) not "glass" (singular)
  - **DOD**: All new tests PASS
  - **Commit**: `test: Add plural rendering tests for GlasswareMessage`
  - **Time**: 30 minutes

- [ ] **T016** [US2] Test annual subscription detection
  - Action: Manual test in dev store
  - Steps:
    1. Create product titled "Coffee Club - Annual"
    2. Add to cart, proceed to checkout
    3. Verify message shows "Includes **4** premium glasses ($100 value)"
  - **DOD**: Annual subscriptions show correct count and total value
  - **Commit**: No commit (manual validation)
  - **Time**: 15 minutes

**Checkpoint**: ✅ US2 Complete - Annual subscribers see "Includes **4** premium glasses ($100 value)"

---

## Phase 5: User Story 3 - International Customer Sees Localized Messaging (Priority: P3)

**Goal**: French-Canadian customer sees glassware messaging in French with correct currency formatting

**Independent Test**: Set locale to fr-CA → add subscription → verify French translation and currency format

**Duration**: 1 hour

### Implementation for User Story 3

- [ ] **T017** [US3] Add locale detection to GlasswareMessage
  - File: `extensions/nudun-messaging-engine/src/components/GlasswareMessage.jsx` (MODIFY)
  - Logic:
    - Access locale: `shopify.localization.value.isoCode`
    - Pass to `shopify.i18n.translate(key, vars)` (already locale-aware)
    - Ensure currency formatting respects locale
  - **DOD**: Component uses correct locale for translations
  - **Commit**: `feat: Add locale detection to GlasswareMessage`
  - **Time**: 30 minutes

- [ ] **T018** [US3] Test French localization manually
  - Action: Manual test in dev store with French locale
  - Steps:
    1. Switch store/browser locale to fr-CA
    2. Add quarterly subscription to cart
    3. Verify: "Comprend **1** verre premium (25,00 $ CAD valeur)"
    4. Add annual subscription
    5. Verify: "Comprend **4** verres premium (100,00 $ CAD valeur)"
  - **DOD**: French translations display correctly, currency formatted per locale
  - **Commit**: No commit (manual validation)
  - **Time**: 20 minutes

- [ ] **T019** [P] [US3] Add fallback test for unsupported locales
  - File: `extensions/nudun-messaging-engine/__tests__/GlasswareMessage.test.jsx` (MODIFY)
  - Test case: Mock `shopify.localization.value.isoCode` as "ja" (Japanese)
  - Expected: Falls back to English (en.default.json)
  - **DOD**: Test passes, fallback behavior verified
  - **Commit**: `test: Add locale fallback test for unsupported locales`
  - **Time**: 10 minutes

**Checkpoint**: ✅ US3 Complete - French customers see localized messaging with proper currency format

---

## Phase 6: User Story 4 - Accessibility Compliance for Screen Readers (Priority: P3)

**Goal**: Screen reader users hear "Premium glass included" alt text + message text

**Independent Test**: Use NVDA/JAWS → navigate checkout with subscription → verify announcements

**Duration**: 1.5 hours

### Implementation for User Story 4

- [ ] **T020** [US4] Verify image alt text implementation
  - File: `extensions/nudun-messaging-engine/src/components/GlasswareMessage.jsx` (REVIEW)
  - Check: `<s-image alt={shopify.i18n.translate('glasswareImageAlt')} />`
  - Verify: Alt text is localized (English: "Premium glass included", French: "Verre premium inclus")
  - **DOD**: Alt text uses localization key, not hardcoded
  - **Commit**: No changes needed (already implemented in T010)
  - **Time**: 10 minutes

- [ ] **T021** [US4] Test with screen reader (NVDA or JAWS)
  - Action: Manual accessibility test
  - Tools: NVDA (Windows) or JAWS
  - Steps:
    1. Enable screen reader
    2. Navigate to checkout with subscription
    3. Verify image announces: "Premium glass included"
    4. Verify text announces: "Includes 1 premium glass $25 value"
    5. Tab through checkout, verify logical order
  - **DOD**: Screen reader announces all content correctly
  - **Commit**: No commit (manual validation)
  - **Time**: 30 minutes

- [ ] **T022** [US4] Verify color contrast ratio
  - Action: Manual accessibility audit
  - Tools: Chrome DevTools Lighthouse or axe DevTools
  - Check: Text color contrast against background ≥4.5:1 (WCAG 2.1 Level AA)
  - Note: Polaris web components should handle this by default
  - **DOD**: Lighthouse accessibility score ≥95, no contrast issues
  - **Commit**: No commit (manual validation)
  - **Time**: 15 minutes

- [ ] **T023** [US4] Test keyboard navigation
  - Action: Manual keyboard accessibility test
  - Steps:
    1. Disable mouse
    2. Tab through checkout with subscription
    3. Verify: Glassware message is in logical tab order
    4. Verify: No focus traps
  - **DOD**: Full keyboard navigation works, logical tab order
  - **Commit**: No commit (manual validation)
  - **Time**: 15 minutes

- [ ] **T024** [P] [US4] Add accessibility documentation
  - File: `extensions/nudun-messaging-engine/README.md` (MODIFY)
  - Add section: "Accessibility Compliance"
  - Document:
    - WCAG 2.1 Level AA compliant
    - Screen reader tested (NVDA/JAWS)
    - Keyboard navigable
    - 4.5:1 color contrast
  - **DOD**: Documentation complete with compliance statement
  - **Commit**: `docs: Add accessibility compliance documentation`
  - **Time**: 20 minutes

**Checkpoint**: ✅ US4 Complete - Extension is WCAG 2.1 compliant, screen reader accessible

---

## Phase 7: Extension Configuration & Deployment

**Purpose**: Configure extension targets and enable deployment

**Duration**: 1 hour

- [ ] **T025** Update extension configuration for line-item rendering
  - File: `extensions/nudun-messaging-engine/shopify.extension.toml` (MODIFY)
  - Add new targeting block:
    ```toml
    [[extensions.targeting]]
    module = "./src/Checkout.jsx"
    target = "purchase.checkout.cart-line-item.render-after"
    ```
  - Research: Verify if Cart UI Extensions support `purchase.cart.line-item.render-after` in API 2025-10
  - If supported: Add cart drawer target as well
  - **DOD**: Extension config updated, Shopify CLI accepts config
  - **Commit**: `config: Add line-item render targets for glassware messaging`
  - **Time**: 30 minutes

- [ ] **T026** Test extension placement in dev store
  - Action: Manual deployment test
  - Steps:
    1. Run `npm run dev`
    2. Verify extension appears in checkout editor
    3. If using block.render: Manually place extension
    4. If using line-item target: Verify auto-placement below subscription lines
    5. Test with quarterly and annual subscriptions
  - **DOD**: Extension renders correctly in both placements
  - **Commit**: No commit (manual validation)
  - **Time**: 30 minutes

**Checkpoint**: ✅ Extension configured and rendering in dev store

---

## Phase 8: Manual End-to-End Testing

**Purpose**: Comprehensive validation of all user stories

**Duration**: 3 hours

- [ ] **T027** Execute full test plan
  - File: Create `docs/testing/glassware-manual-test-report.md`
  - Test cases (11 total):
    
    | # | Test Case | Expected Result | Actual | Pass/Fail |
    |---|-----------|-----------------|--------|-----------|
    | 1 | Add "Coffee - Quarterly" to cart | "Includes **1** premium glass ($25 value)" appears | TBD | TBD |
    | 2 | Add "Coffee - Annual" to cart | "Includes **4** premium glasses ($100 value)" appears | TBD | TBD |
    | 3 | Add "Coffee Subscription" (generic) | "Includes **1** premium glass ($25 value)" appears | TBD | TBD |
    | 4 | Add regular coffee bag | No glassware message | TBD | TBD |
    | 5 | Mixed cart (quarterly + annual + regular) | Correct messaging per subscription line | TBD | TBD |
    | 6 | Set quarterly qty to 5 | Still shows "1 glass ($25 value)", not 5 | TBD | TBD |
    | 7 | Switch locale to fr-CA | "Comprend **1** verre premium (25,00 $ valeur)" | TBD | TBD |
    | 8 | View on mobile (375px) | Image + text fit, no overflow | TBD | TBD |
    | 9 | Screen reader (NVDA) | Alt text + message announced | TBD | TBD |
    | 10 | Block CDN URL (simulate failure) | Text-only message appears | TBD | TBD |
    | 11 | 10 subscriptions in cart | Renders in <100ms, no performance issues | TBD | TBD |
  
  - **DOD**: All 11 test cases PASS, documented with screenshots
  - **Commit**: `test: Add manual E2E test report for glassware feature`
  - **Time**: 2.5 hours

- [ ] **T028** Performance testing
  - Action: Measure extension render time
  - Tools: Chrome DevTools Performance tab
  - Benchmark: Extension render time <100ms (Constitution requirement)
  - Test with: 1 subscription, 5 subscriptions, 10 subscriptions
  - **DOD**: All scenarios render <100ms
  - **Commit**: Include in T027 test report
  - **Time**: 30 minutes

**Checkpoint**: ✅ All manual tests PASS, performance meets requirements

---

## Phase 9: Polish & Documentation

**Purpose**: Finalize documentation and code quality

**Duration**: 2 hours

- [ ] **T029** [P] Update extension README
  - File: `extensions/nudun-messaging-engine/README.md` (MODIFY)
  - Add sections:
    - Architecture overview (detection → component → orchestration)
    - How to add new messaging use cases
    - Configuration (glass product handle, pricing)
    - Testing instructions
  - **DOD**: README comprehensively documents extension
  - **Commit**: `docs: Update extension README with architecture and usage`
  - **Time**: 45 minutes

- [ ] **T030** [P] Update copilot-instructions.md
  - File: `.github/copilot-instructions.md` (MODIFY)
  - Add new patterns discovered:
    - Detection utility pattern (reusable for other features)
    - Component-based messaging pattern
    - Glass value fetching and display pattern
  - Add to "Project-Specific Patterns" section
  - **DOD**: Copilot instructions include new patterns
  - **Commit**: `docs: Add glassware messaging patterns to copilot instructions`
  - **Time**: 30 minutes

- [ ] **T031** [P] Update QUICK-REFERENCE.md (if exists)
  - File: `QUICK-REFERENCE.md` (MODIFY, if exists)
  - Add: Glassware detection pattern example
  - Add: Component props interface
  - **DOD**: Quick reference includes glassware patterns
  - **Commit**: Include with T030 (docs commit)
  - **Time**: 15 minutes

- [ ] **T032** Code review and cleanup
  - Action: Self-review all changed files
  - Check:
    - No `@ts-ignore` directives (Constitution violation)
    - All functions have JSDoc comments
    - No console.log statements (use proper logging)
    - No hardcoded strings (use localization keys)
    - Consistent code style
  - **DOD**: Code passes self-review checklist
  - **Commit**: `refactor: Code cleanup and documentation improvements` (if changes needed)
  - **Time**: 30 minutes

**Checkpoint**: ✅ Documentation complete, code ready for review

---

## Phase 10: Final Validation & Deployment

**Purpose**: Constitutional compliance check and production readiness

**Duration**: 1 hour

- [ ] **T033** Constitutional compliance final check
  - Review: SHOPIFY-APPROVAL-CHECKLIST.md
  - Verify:
    - [x] Optional chaining on all `shopify.*` access
    - [x] Graceful degradation (image fallback, null handling)
    - [x] No `@ts-ignore` in production code
    - [x] Input validation (line item title checks)
    - [x] GDPR compliant (no PII stored/transmitted)
    - [x] Mobile responsive (tested on 320px+)
    - [x] WCAG 2.1 accessible (screen reader, contrast, keyboard)
  - **DOD**: All checklist items verified
  - **Commit**: No commit (validation step)
  - **Time**: 30 minutes

- [ ] **T034** Create pull request
  - Action: Prepare PR for review
  - PR title: "Add included glassware messaging for subscriptions"
  - PR description template:
    ```markdown
    ## Feature: Included Glassware Messaging (Dynamic Messaging Engine v1.0)
    
    ### What
    Displays "Includes **X** premium glass(es) ($Y value)" for subscription products in checkout.
    
    ### Why
    - Shows customers the value of included glasses
    - Prevents duplicate glass purchases
    - Increases subscription conversion by emphasizing benefits
    
    ### User Stories Delivered
    - ✅ US1 (P1): Quarterly subscribers see 1 glass with value
    - ✅ US2 (P2): Annual subscribers see 4 glasses with total value
    - ✅ US3 (P3): French localization support
    - ✅ US4 (P3): WCAG 2.1 accessibility compliance
    
    ### Testing
    - Unit tests: 12+ cases, 100% detection coverage
    - Component tests: 14+ cases, 95% coverage
    - Manual E2E: 11 test cases, all PASS
    - Accessibility: Lighthouse score 96, NVDA tested
    - Performance: <100ms render time (10 subscriptions)
    
    ### Architecture
    - Detection utility: `subscriptionDetection.js`
    - Price lookup: `glassProductLookup.js` (NEW)
    - Message component: `GlasswareMessage.jsx`
    - Orchestration: `Checkout.jsx` (modified)
    
    ### Reviewer Notes
    - Verify: Glass product handle is "premium-glass" in store
    - Verify: Image URL loads correctly in production
    - Verify: French translations are accurate
    - Test: Multiple subscriptions in cart (performance)
    ```
  - **DOD**: PR created, reviewers assigned
  - **Commit**: No commit (GitHub action)
  - **Time**: 20 minutes

- [ ] **T035** Update Spec-Kit workflow status
  - File: `.specify/WORKFLOW-STATUS.md` (MODIFY)
  - Update: Workflow stage → "🟢 IMPLEMENTATION COMPLETE"
  - Update: Next action → "Ready for code review and deployment"
  - **DOD**: Workflow status reflects completion
  - **Commit**: `docs: Mark glassware implementation as complete`
  - **Time**: 10 minutes

**Checkpoint**: ✅ Implementation complete, PR ready for review

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
┌───────────────────────────────────────┐
│ Phases 3-6 (User Stories)            │
│ - Can run in parallel (if staffed)   │
│ - Or sequentially by priority (P1→P3)│
└───────────────────────────────────────┘
    ↓
Phase 7 (Extension Config)
    ↓
Phase 8 (Manual Testing)
    ↓
Phase 9 (Polish & Docs)
    ↓
Phase 10 (Final Validation)
```

### Critical Path (Sequential)

**Minimum path to MVP (User Story 1 only)**:
```
T001-T003 (Setup) → T004-T006 (Foundation) → T007-T011 (US1 Implementation)
= 1h + 3h + 5h = 9 hours for MVP
```

**Full feature (all 4 user stories)**:
```
T001-T006 (Setup + Foundation) → T007-T026 (All User Stories + Config) → T027-T035 (Testing + Docs)
= 4h + 10h + 6h = 20 hours total
```

### Parallel Opportunities

**Within Setup (Phase 1)**: T001, T002, T003 can run together (3 developers)

**Within Foundation (Phase 2)**: T006 (price lookup) runs parallel to T004-T005 (detection + tests)

**User Stories (Phases 3-6)**: All 4 user stories can be implemented in parallel:
- Developer A: US1 (T007-T011)
- Developer B: US2 (T012-T016)
- Developer C: US3 (T017-T019)
- Developer D: US4 (T020-T024)

**Within Polish (Phase 9)**: T029, T030, T031 can run together (3 developers)

---

## Implementation Strategy

### Strategy 1: MVP First (Recommended for Solo Developer)

**Goal**: Ship US1 (quarterly subscriptions with value) as fast as possible

1. ✅ Complete Phase 1-2: Setup + Foundation (4 hours)
2. ✅ Complete Phase 3: US1 only (5 hours)
3. ✅ Complete Phase 7: Extension config (1 hour)
4. ✅ Complete Phase 8: Manual testing (US1 scenarios only) (1.5 hours)
5. 🚀 **Deploy MVP**: Quarterly subscriptions show glass value (11.5 hours)
6. ✅ Add US2-US4 incrementally in follow-up PRs

**Timeline**: ~1.5 days for MVP, ~2.5 days for full feature

### Strategy 2: Parallel Team (4 Developers)

**Goal**: Ship all 4 user stories simultaneously

1. ✅ All devs: Phase 1-2 together (4 hours)
2. ✅ Split user stories:
   - Dev A: US1 (5 hours)
   - Dev B: US2 (2 hours)
   - Dev C: US3 (1 hour)
   - Dev D: US4 (1.5 hours)
3. ✅ Merge user stories (30 minutes integration)
4. ✅ Dev A: Phase 7-8 (4 hours)
5. ✅ All devs: Phase 9-10 split (2 hours)

**Timeline**: ~1.5 days for full feature (parallelized)

### Strategy 3: Incremental Delivery (Recommended for Production)

**Goal**: Ship in small, testable increments

**Iteration 1** (MVP):
- Phase 1-2: Foundation
- Phase 3: US1 (quarterly with value)
- Phase 7-8: Config + testing
- **Deploy** → Gather feedback

**Iteration 2** (Enhanced):
- Phase 4: US2 (annual with total value)
- Test + **Deploy** → Monitor conversion

**Iteration 3** (i18n):
- Phase 5: US3 (French localization)
- Test + **Deploy** → Expand to French Canada

**Iteration 4** (Compliance):
- Phase 6: US4 (accessibility)
- Phase 9-10: Polish + validation
- **Deploy** → Shopify app submission

**Timeline**: ~3-4 days across 4 iterations (1 week)

---

## Commit Strategy

### Incremental Commits (One Per Task)

Each task ID maps to exactly one commit (except manual validation tasks):

```bash
# Phase 1: Setup
git commit -m "chore: Add Vitest testing infrastructure" # T001-T003

# Phase 2: Foundation
git commit -m "feat: Add subscription detection utility" # T004
git commit -m "test: Add unit tests for subscription detection" # T005
git commit -m "feat: Add glass product price lookup utility" # T006

# Phase 3: User Story 1
git commit -m "test: Add component tests for GlasswareMessage" # T007
git commit -m "i18n: Add English glassware messaging keys" # T008
git commit -m "i18n: Add French glassware messaging keys" # T009
git commit -m "feat: Add GlasswareMessage component with value display" # T010
git commit -m "feat: Integrate glassware messaging into checkout extension" # T011

# Phase 4: User Story 2
git commit -m "i18n: Add English plural glassware keys" # T012
git commit -m "i18n: Add French plural glassware keys" # T013
git commit -m "feat: Add plural support to GlasswareMessage component" # T014
git commit -m "test: Add plural rendering tests for GlasswareMessage" # T015

# Phase 5: User Story 3
git commit -m "feat: Add locale detection to GlasswareMessage" # T017
git commit -m "test: Add locale fallback test for unsupported locales" # T019

# Phase 6: User Story 4
git commit -m "docs: Add accessibility compliance documentation" # T024

# Phase 7: Config
git commit -m "config: Add line-item render targets for glassware messaging" # T025

# Phase 8: Testing
git commit -m "test: Add manual E2E test report for glassware feature" # T027

# Phase 9: Polish
git commit -m "docs: Update extension README with architecture and usage" # T029
git commit -m "docs: Add glassware messaging patterns to copilot instructions" # T030
git commit -m "refactor: Code cleanup and documentation improvements" # T032 (if needed)

# Phase 10: Final
git commit -m "docs: Mark glassware implementation as complete" # T035
```

**Total Commits**: ~17-18 commits (clean, atomic history)

---

## Risk Mitigation Tasks

### Risk: Glass Product Not Found in Store

**Mitigation Task** (add to Phase 2):
- [ ] **T006a** Create glass product if missing
  - Action: Check if product with handle "premium-glass" exists in dev store
  - If missing: Create product via Shopify admin or GraphQL
  - Product details:
    - Title: "Premium Glass"
    - Handle: "premium-glass"
    - Price: $25.00 USD
    - Published: Yes (visible in store)
  - **DOD**: Product exists and accessible via Storefront API
  - **Time**: 15 minutes

### Risk: Cart Drawer API Not Supported

**Mitigation Task** (add to Phase 7):
- [ ] **T025a** Research Cart UI Extensions target support
  - Action: Check Shopify docs for `purchase.cart.line-item.render-after` in API 2025-10
  - If NOT supported: Remove cart drawer target from T025
  - If supported: Keep both targets (cart + checkout)
  - Document: Findings in T025 commit message
  - **DOD**: Target support confirmed, config reflects reality
  - **Time**: 15 minutes

---

## Notes & Best Practices

### Test-Driven Development (TDD)

- ✅ Write tests FIRST (T005, T007, T015, T019)
- ✅ Verify tests FAIL before implementation
- ✅ Implement code until tests PASS
- ✅ Refactor if needed (tests protect you)

### Commit Hygiene

- ✅ One logical change per commit
- ✅ Descriptive commit messages (conventional commits format)
- ✅ No WIP commits on feature branch
- ✅ Squash fixup commits before PR

### Code Quality Gates

Before merging each phase:
- [ ] All tests PASS (unit + component)
- [ ] No TypeScript errors
- [ ] No console.log statements
- [ ] All functions have JSDoc
- [ ] No `@ts-ignore` directives

### Performance Monitoring

Track throughout implementation:
- Extension bundle size: Target <50KB
- Render time: Target <100ms
- API query time: Target <200ms (glass price lookup)
- Test execution time: Keep <5 seconds total

---

## Success Metrics (Validation)

### Technical Metrics (Measure at T028)

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Bundle size | <50KB | TBD | TBD |
| Render time (1 sub) | <100ms | TBD | TBD |
| Render time (10 subs) | <100ms | TBD | TBD |
| Unit test coverage | 100% (detection) | TBD | TBD |
| Component test coverage | ≥90% | TBD | TBD |
| Lighthouse accessibility | ≥95 | TBD | TBD |

### Functional Metrics (Validate at T027)

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Detection accuracy | 100% (with keywords) | TBD | TBD |
| Localization coverage | 2 locales, 100% keys | TBD | TBD |
| Price display accuracy | Matches store product | TBD | TBD |
| Error rate | 0 JS errors | TBD | TBD |
| Mobile compatibility | Works 320px+ | TBD | TBD |

---

## Task Summary

**Total Tasks**: 35 tasks (31 implementation + 4 validation)  
**Total Duration**: 20 hours (~2.5 days for solo developer)  
**Critical Path**: 17 hours (T001→T006→T007→T011→T025→T027→T035)  
**MVP Path**: 11.5 hours (Foundation + US1 + Config + Basic testing)

**Parallel Opportunities**: 8 tasks can run in parallel (marked with [P])  
**Test Tasks**: 7 tasks (TDD approach, write tests first)  
**Manual Validation**: 6 tasks (no commits, validation only)

**Phases**:
- Phase 1-2: Foundation (4 hours) ← BLOCKING
- Phase 3: US1 - Quarterly with value (5 hours) ← MVP
- Phase 4: US2 - Annual with total value (2 hours)
- Phase 5: US3 - Localization (1 hour)
- Phase 6: US4 - Accessibility (1.5 hours)
- Phase 7: Config (1 hour)
- Phase 8: Manual testing (3 hours)
- Phase 9: Polish & docs (2 hours)
- Phase 10: Final validation (1 hour)

**Constitutional Compliance**: ✅ All 5 principles validated in T033

---

**Tasks Version**: 1.0.0  
**Ready for**: `/speckit.implement` phase  
**Git Commit**: (pending commit after task creation)

**Quick Links**:
- [Implementation Plan](../plans/included-glassware-plan.md)
- [Specification](../specs/included-glassware.md)
- [Constitution](../memory/constitution.md)
- [Workflow Status](../WORKFLOW-STATUS.md)
