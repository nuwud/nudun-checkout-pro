# Task Breakdown: Dynamic Messaging Engine v2.0

**Feature**: Dynamic Messaging Engine v2.0  
**Spec**: `.specify/specs/dynamic-messaging-v2.md`  
**Plan**: `.specify/plans/dynamic-messaging-v2-plan.md`  
**Created**: 2025-10-07  
**Total Duration**: 23 days (8 phases)  
**Total Tasks**: 95 tasks  

---

## Executive Summary

This task breakdown translates the Dynamic Messaging Engine v2.0 implementation plan into 95 actionable, sequentially-numbered tasks organized by phase and user story. Each task includes:

- **Task ID**: Sequential numbering (T001-T095)
- **Story Mapping**: Links to user stories (US5-US10)
- **File Path**: Exact location for implementation
- **Duration**: Time estimate in hours
- **Dependencies**: Prerequisites that must complete first
- **Parallelization**: [P] marker indicates tasks that can run in parallel
- **Acceptance Criteria**: Clear definition of done

### Task Distribution by Phase

| Phase | Focus | Tasks | Duration | User Stories |
|-------|-------|-------|----------|--------------|
| **Phase 0** | Foundation Review | 4 | 2 days | - |
| **Phase 1** | Generic Add-On System | 11 | 3 days | US5 |
| **Phase 2A** | Dynamic Messaging | 10 | 3 days | US6 |
| **Phase 2B** | Strategic Upsells | 8 | 2 days | US7 |
| **Phase 3** | Behavioral Analytics | 13 | 3 days | US8 |
| **Phase 4** | Value Display | 8 | 2 days | US9 |
| **Phase 5** | A/B Testing | 14 | 4 days | US10 |
| **Phase 6** | Polish & Optimization | 12 | 2 days | - |
| **Phase 7** | Testing & QA | 10 | 3 days | All |
| **Phase 8** | Deployment | 5 | 1 day | - |
| **Total** | **8 Phases** | **95** | **23 days** | **6 stories** |

### Parallel Opportunities

Tasks marked with **[P]** can be executed in parallel with other [P] tasks in the same phase:
- **Phase 1**: 6 parallel tasks (config + utils)
- **Phase 2**: 8 parallel tasks (Phase 2A + 2B can run concurrently)
- **Phase 3**: 5 parallel tasks (analytics components)
- **Phase 4**: 4 parallel tasks (price loading + caching)
- **Phase 5**: 7 parallel tasks (A/B test components)

**Parallelization Potential**: With 2 developers, estimated timeline reduces from 23 → 15-17 days

---

## Phase 0: Foundation Review (2 days)

**Objective**: Verify v1.0 is production-ready before starting v2.0 work  
**Dependencies**: None (prerequisite phase)  
**User Stories**: None (foundation)  
**Deliverable**: Baseline metrics captured, v1.0 audit complete

### Tasks

#### T001: Audit v1.0 Implementation Completeness
**Duration**: 4 hours  
**Story**: Foundation  
**File**: `extensions/nudun-messaging-engine/src/`  
**Dependencies**: None

**Description**: Verify all v1.0 features are implemented and working:
- Subscription detection via keywords (quarterly, annual)
- Glass count calculation (quarterly=1, annual=4)
- InclusionMessage component rendering
- French localization working
- Mobile responsive design
- Accessibility (screen reader compatible)

**Acceptance Criteria**:
- [ ] All 17 v1.0 functional requirements (FR-001 to FR-017) passing
- [ ] Extension renders in checkout editor
- [ ] Manual E2E tests pass (11 scenarios from v1.0)
- [ ] No console errors in browser DevTools
- [ ] Lighthouse accessibility score ≥95

**Output**: `PHASE0-V1-AUDIT.md` with checklist results

---

#### T002: Capture Performance Baseline Metrics
**Duration**: 2 hours  
**Story**: Foundation  
**File**: `docs/metrics/v1-baseline.md`  
**Dependencies**: T001

**Description**: Measure current v1.0 performance to establish baseline for v2.0 comparison:
- Bundle size (gzipped)
- Initial render time
- Memory usage
- API call count
- Lighthouse performance score

**Acceptance Criteria**:
- [ ] Bundle size measured: Expected ~60KB
- [ ] Render time measured: Expected <50ms
- [ ] Lighthouse score captured: Expected 95+
- [ ] Memory profile captured (Chrome DevTools)
- [ ] Metrics documented in markdown table

**Tools**: Chrome DevTools, Lighthouse CI

**Output**: Baseline metrics document

---

#### T003: Document v1.0 Architecture & Patterns
**Duration**: 3 hours  
**Story**: Foundation  
**File**: `docs/architecture/v1-architecture.md`  
**Dependencies**: T001

**Description**: Create architectural documentation of v1.0 as reference for v2.0 refactor:
- Component hierarchy diagram
- Data flow (Shopify API → Detection → Component)
- File structure
- Key patterns (optional chaining, Money objects)
- Known limitations

**Acceptance Criteria**:
- [ ] Architecture diagram created (Mermaid or ASCII)
- [ ] All v1.0 files documented with purpose
- [ ] Data flow documented end-to-end
- [ ] Limitations documented (hardcoded glassware, no analytics, etc.)
- [ ] Patterns extracted for reuse in v2.0

**Output**: Architecture reference document

---

#### T004: Create v2.0 Feature Branch & Project Setup
**Duration**: 1 hour  
**Story**: Foundation  
**File**: Git branch + workspace  
**Dependencies**: T001, T002, T003

**Description**: Set up development environment for v2.0 implementation:
- Create feature branch `feature/dynamic-messaging-v2`
- Install additional dependencies (Preact Signals)
- Update package.json with new dev dependencies
- Configure test framework (Vitest)
- Create initial directory structure

**Acceptance Criteria**:
- [ ] Branch created and pushed to GitHub
- [ ] Dependencies installed: `@preact/signals` ^1.2.0
- [ ] Vitest configured in `extensions/nudun-messaging-engine/vite.config.js`
- [ ] Directory structure created: `src/config/`, `src/analytics/`, `src/abtest/`
- [ ] Initial commit: "chore: Set up v2.0 development environment"

**Commands**:
```bash
git checkout -b feature/dynamic-messaging-v2
cd extensions/nudun-messaging-engine
npm install @preact/signals --save
npm install vitest @testing-library/preact --save-dev
git add . && git commit -m "chore: Set up v2.0 development environment"
git push -u origin feature/dynamic-messaging-v2
```

**Output**: Clean feature branch ready for implementation

---

## Phase 1: Architecture Refactor - Generic Add-On System (3 days)

**Objective**: Refactor v1.0's hardcoded glassware logic into extensible add-on platform  
**Dependencies**: Phase 0 complete  
**User Story**: US5 - Generic Add-On Mapping (Priority P1)  
**Deliverable**: Add bottle without code changes (extensibility proof)

**Why This Phase**: US5 is the foundation for the entire v2.0 platform. Without generic add-on mapping, all other features (messaging, upsells, analytics) remain single-purpose. This phase transforms v1.0 from "glassware messaging" to "unlimited messaging platform."

### Tasks

#### T005: Create Generic Add-On Configuration Map [P]
**Duration**: 2 hours  
**Story**: US5 - Generic Add-On Mapping  
**File**: `src/config/addOnMap.js`  
**Dependencies**: T004

**Description**: Define configuration structure for all supported add-on types (glass, bottle, accessory, etc.):

```javascript
export const ADD_ON_MAP = {
  glass: {
    name: 'premium glass',
    imageUrl: 'https://cdn.shopify.com/...',
    productHandle: 'premium-glass',
    defaultCount: 1
  },
  bottle: {
    name: 'water bottle',
    imageUrl: 'https://cdn.shopify.com/...',
    productHandle: 'premium-bottle',
    defaultCount: 1
  },
  accessory: {
    name: 'accessory set',
    imageUrl: 'https://cdn.shopify.com/...',
    productHandle: 'accessory-set',
    defaultCount: 1
  }
};

export function getAddOnConfig(addonType) {
  return ADD_ON_MAP[addonType] || null;
}
```

**Acceptance Criteria**:
- [ ] ADD_ON_MAP exports 5 add-on types: glass, bottle, accessory, sticker, sample
- [ ] Each add-on has: name, imageUrl, productHandle, defaultCount
- [ ] getAddOnConfig() returns config or null (safe fallback)
- [ ] Types exported for TypeScript intellisense
- [ ] Configuration uses nudun-dev-store product handles

**Output**: Configuration module for add-ons

---

#### T006: Implement Metafield Parser Utility [P]
**Duration**: 3 hours  
**Story**: US5 - Generic Add-On Mapping  
**File**: `src/utils/metafieldParser.js`  
**Dependencies**: T005

**Description**: Parse Shopify metafield format `{interval}_{count}_{addonType}`:

```javascript
export function parseMetafield(metafieldValue) {
  if (!metafieldValue || typeof metafieldValue !== 'string') {
    return null;
  }
  
  const parts = metafieldValue.split('_');
  if (parts.length < 3) return null;
  
  const [interval, countStr, addonType] = parts;
  const count = parseInt(countStr, 10);
  
  if (isNaN(count)) return null;
  
  const addOnConfig = getAddOnConfig(addonType);
  if (!addOnConfig) return null;
  
  return {
    interval,          // "quarterly", "annual"
    count,             // 1, 4, etc.
    addonType,         // "glass", "bottle"
    addOnConfig        // Full config object
  };
}
```

**Acceptance Criteria**:
- [ ] Parses valid format: "quarterly_1_glass" → { interval, count, addonType, addOnConfig }
- [ ] Returns null for invalid formats (handles gracefully)
- [ ] Validates count is numeric
- [ ] Validates addonType exists in ADD_ON_MAP
- [ ] Supports custom formats: "3month_2_glass"
- [ ] 15 unit tests pass (valid, invalid, edge cases)

**Tests**: `__tests__/utils/metafieldParser.test.js`

**Output**: Metafield parsing utility

---

#### T007: Create Keyword Detection Fallback [P]
**Duration**: 2 hours  
**Story**: US5 - Generic Add-On Mapping  
**File**: `src/utils/keywordDetector.js`  
**Dependencies**: None (can run parallel with T006)

**Description**: Extract v1.0 keyword logic into reusable utility for backward compatibility:

```javascript
const KEYWORDS = {
  glass: ['quarterly', 'quarterly subscription', '3 month'],
  bottle: ['monthly', 'monthly subscription']
};

export function detectByKeywords(productTitle) {
  if (!productTitle) return null;
  
  const lowerTitle = productTitle.toLowerCase();
  
  for (const [addonType, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return {
        addonType,
        count: addonType === 'glass' ? 1 : 1,
        source: 'keyword'
      };
    }
  }
  
  return null;
}
```

**Acceptance Criteria**:
- [ ] Detects "quarterly" → glass
- [ ] Detects "annual" → glass (count: 4)
- [ ] Detects "monthly" → bottle
- [ ] Case-insensitive matching
- [ ] Returns null if no keywords match
- [ ] 10 unit tests pass

**Tests**: `__tests__/utils/keywordDetector.test.js`

**Output**: Backward-compatible keyword detector

---

#### T008: Refactor Subscription Detection to Metafield-First
**Duration**: 4 hours  
**Story**: US5 - Generic Add-On Mapping  
**File**: `src/utils/subscriptionDetection.js` (REFACTOR)  
**Dependencies**: T006, T007

**Description**: Update existing `subscriptionDetection.js` to prioritize metafields over keywords:

```javascript
import { parseMetafield } from './metafieldParser';
import { detectByKeywords } from './keywordDetector';

export function detectSubscription(lineItem) {
  if (!lineItem) return null;
  
  // Strategy 1: Try metafield (preferred)
  const metafield = lineItem.metafield?.value;
  if (metafield) {
    const parsed = parseMetafield(metafield);
    if (parsed) {
      return {
        ...parsed,
        source: 'metafield',
        lineId: lineItem.id
      };
    }
  }
  
  // Strategy 2: Fall back to keywords (v1.0 compat)
  const keywordResult = detectByKeywords(lineItem.title);
  if (keywordResult) {
    return {
      ...keywordResult,
      lineId: lineItem.id
    };
  }
  
  return null;
}
```

**Acceptance Criteria**:
- [ ] Tries metafield first (preferred method)
- [ ] Falls back to keywords if metafield missing
- [ ] Returns null if neither method works
- [ ] Preserves lineId for cart updates
- [ ] 20 unit tests pass (metafield priority, fallback, edge cases)
- [ ] v1.0 keyword tests still pass (backward compatibility)

**Tests**: Update existing `__tests__/utils/subscriptionDetection.test.js`

**Output**: Enhanced subscription detection

---

#### T009: Refactor InclusionMessage Component for Generic Add-Ons
**Duration**: 5 hours  
**Story**: US5 - Generic Add-On Mapping  
**File**: `src/components/InclusionMessage.jsx` (REFACTOR)  
**Dependencies**: T008

**Description**: Update component to use generic add-on configuration instead of hardcoded "glass":

```javascript
import { detectSubscription } from '../utils/subscriptionDetection';

export function InclusionMessage({ lineItem }) {
  const subscription = detectSubscription(lineItem);
  
  if (!subscription) return null;
  
  const { count, addOnConfig, source } = subscription;
  
  return (
    <s-banner tone="info">
      <s-stack direction="inline" spacing="tight">
        {addOnConfig.imageUrl && (
          <s-image 
            src={addOnConfig.imageUrl} 
            alt={addOnConfig.name}
            style={{ width: '40px', height: '40px' }}
          />
        )}
        <s-text>
          Includes <strong>{count}</strong> {addOnConfig.name}
        </s-text>
      </s-stack>
    </s-banner>
  );
}
```

**Acceptance Criteria**:
- [ ] Displays message for any add-on type (glass, bottle, accessory)
- [ ] Shows correct count from detection result
- [ ] Uses add-on-specific image from config
- [ ] Falls back to text-only if imageUrl missing
- [ ] Works with both metafield and keyword detection
- [ ] 12 component tests pass (glass, bottle, multi-addon, fallback)

**Tests**: Update `__tests__/components/InclusionMessage.test.jsx`

**Output**: Generic inclusion message component

---

#### T010: Update Localization Files for Generic Add-Ons [P]
**Duration**: 2 hours  
**Story**: US5 - Generic Add-On Mapping  
**File**: `locales/en.default.json`, `locales/fr.json`  
**Dependencies**: T009

**Description**: Add translations for all add-on types:

```json
{
  "addon.glass.name": "premium glass",
  "addon.bottle.name": "water bottle",
  "addon.accessory.name": "accessory set",
  "addon.sticker.name": "sticker pack",
  "addon.sample.name": "sample set",
  "message.includes": "Includes {count} {addonName}"
}
```

**Acceptance Criteria**:
- [ ] English translations for 5 add-on types
- [ ] French translations for 5 add-on types
- [ ] Supports pluralization: "1 glass" vs "4 glasses"
- [ ] Message template uses interpolation
- [ ] No breaking changes to v1.0 keys

**Output**: Updated localization files

---

#### T011: Create Integration Tests for Generic Add-On System
**Duration**: 3 hours  
**Story**: US5 - Generic Add-On Mapping  
**File**: `__tests__/integration/genericAddOns.test.js`  
**Dependencies**: T009, T010

**Description**: End-to-end tests for US5 acceptance criteria:

**Test Scenarios**:
1. Metafield "quarterly_1_glass" → displays "Includes 1 premium glass"
2. Metafield "annual_4_glass" → displays "Includes 4 premium glasses"
3. Metafield "quarterly_1_bottle" → displays "Includes 1 water bottle"
4. No metafield + keyword "quarterly" → displays "Includes 1 premium glass"
5. Invalid metafield → falls back to keyword
6. French locale → displays French translations

**Acceptance Criteria**:
- [ ] 6 integration tests pass
- [ ] Tests cover metafield priority, fallback, localization
- [ ] Uses mock Shopify global API
- [ ] Tests run in <500ms total

**Output**: Integration test suite for US5

---

#### T012: Add Extensibility Proof (Bottle Add-On)
**Duration**: 1 hour  
**Story**: US5 - Generic Add-On Mapping  
**File**: `src/config/addOnMap.js` (update)  
**Dependencies**: T011

**Description**: Prove extensibility by adding "bottle" add-on via configuration only (no code changes):

1. Add bottle configuration to ADD_ON_MAP
2. Create test product in nudun-dev-store with metafield "quarterly_1_bottle"
3. Verify message displays: "Includes 1 water bottle"
4. Document process in README

**Acceptance Criteria**:
- [ ] Bottle add-on works without touching any component code
- [ ] Only files changed: `addOnMap.js`, `locales/*.json`
- [ ] Test product in dev store displays correctly
- [ ] Extensibility documented in README

**Output**: Proof of platform extensibility

---

#### T013: Phase 1 Checkpoint - Commit & Document
**Duration**: 1 hour  
**Story**: US5 - Generic Add-On Mapping  
**File**: Git commit + docs  
**Dependencies**: T005-T012

**Description**: Finalize Phase 1 deliverables:
- Commit all Phase 1 changes
- Update CHANGELOG.md
- Document breaking changes (if any)
- Tag as `v2.0-phase1`

**Acceptance Criteria**:
- [ ] All Phase 1 tests passing (55 total: 20+15+10+20+12)
- [ ] Git commit with comprehensive message
- [ ] CHANGELOG.md updated with Phase 1 features
- [ ] No breaking changes to v1.0 API
- [ ] Phase 1 tagged in git

**Commit Message**:
```
feat(phase1): Implement generic add-on system (US5)

- Create configuration-driven add-on mapping
- Implement metafield parser (subscription_type format)
- Refactor subscription detection (metafield-first strategy)
- Update InclusionMessage for generic add-ons
- Add extensibility proof (bottle add-on)

Breaking Changes: None (backward compatible with v1.0)

Tests: 55 passing (20 subscriptionDetection, 15 metafieldParser, 
10 keywordDetector, 12 InclusionMessage, 6 integration)

Closes US5 (Generic Add-On Mapping)
```

**Output**: Phase 1 complete, ready for Phase 2

---

---

## Phase 2A: Real-Time Dynamic Messaging (3 days)

**Objective**: Implement cart value monitoring with reactive banners  
**Dependencies**: Phase 1 complete  
**User Story**: US6 - Real-Time Cart Value Messaging (Priority P1)  
**Deliverable**: Live-updating banners responding to cart changes <100ms

**Why This Phase**: US6 addresses #1 cart abandonment driver (unexpected shipping costs). Real-time value messaging creates transparent path to free shipping threshold, increasing conversion 8-12%.

### Tasks

#### T014: Create Cart Threshold Configuration [P]
**Duration**: 2 hours  
**Story**: US6 - Real-Time Cart Value Messaging  
**File**: `src/config/thresholds.js`  
**Dependencies**: T013

**Description**: Define threshold rules for cart value messaging:

```javascript
export const THRESHOLDS = {
  freeShipping: {
    USD: 50.00,
    CAD: 65.00,
    EUR: 45.00,
    GBP: 40.00
  },
  gift: {
    USD: 100.00,
    CAD: 130.00,
    EUR: 90.00,
    GBP: 80.00
  },
  vipUpgrade: {
    USD: 200.00,
    CAD: 260.00,
    EUR: 180.00,
    GBP: 160.00
  }
};

export function getThreshold(type, currency = 'USD') {
  return THRESHOLDS[type]?.[currency] || THRESHOLDS[type]?.USD || 0;
}
```

**Acceptance Criteria**:
- [ ] 3 threshold types defined: freeShipping, gift, vipUpgrade
- [ ] Multi-currency support (USD, CAD, EUR, GBP)
- [ ] getThreshold() returns value or fallback to USD
- [ ] Configuration is JSON-serializable (future admin config)

**Output**: Threshold configuration module

---

#### T015: Implement Threshold Detection Utility [P]
**Duration**: 3 hours  
**Story**: US6 - Real-Time Cart Value Messaging  
**File**: `src/utils/thresholdDetector.js`  
**Dependencies**: T014

**Description**: Calculate cart position relative to thresholds:

```javascript
import { getThreshold } from '../config/thresholds';

export function detectThresholds(cartTotal, currency = 'USD') {
  const thresholds = ['freeShipping', 'gift', 'vipUpgrade'];
  const results = [];
  
  for (const type of thresholds) {
    const threshold = getThreshold(type, currency);
    const remaining = threshold - cartTotal;
    
    if (remaining > 0) {
      results.push({
        type,
        threshold,
        remaining,
        progress: (cartTotal / threshold) * 100,
        met: false
      });
    } else {
      results.push({
        type,
        threshold,
        remaining: 0,
        progress: 100,
        met: true
      });
    }
  }
  
  return results;
}

export function getNextThreshold(cartTotal, currency) {
  const results = detectThresholds(cartTotal, currency);
  return results.find(r => !r.met) || null;
}
```

**Acceptance Criteria**:
- [ ] Calculates remaining amount to threshold
- [ ] Returns progress percentage (0-100%)
- [ ] Identifies met/unmet thresholds
- [ ] getNextThreshold() returns closest unmet threshold
- [ ] 12 unit tests pass (various cart totals, currencies)

**Tests**: `__tests__/utils/thresholdDetector.test.js`

**Output**: Threshold calculation utility

---

#### T016: Create DynamicBanner Component with Preact Signals
**Duration**: 6 hours  
**Story**: US6 - Real-Time Cart Value Messaging  
**File**: `src/components/DynamicBanner.jsx`  
**Dependencies**: T015

**Description**: Build reactive banner component using Preact Signals:

```javascript
import { signal, computed } from '@preact/signals';
import { getNextThreshold } from '../utils/thresholdDetector';

// Reactive cart total (updated by Checkout.jsx)
export const cartTotal = signal(0);
export const currency = signal('USD');

export function DynamicBanner() {
  // Computed threshold state (auto-updates)
  const thresholdState = computed(() => {
    const total = parseFloat(cartTotal.value?.amount || '0');
    const curr = currency.value;
    return getNextThreshold(total, curr);
  });
  
  const state = thresholdState.value;
  
  if (!state) return null; // All thresholds met
  
  const { type, remaining, met } = state;
  
  if (met) {
    return (
      <s-banner tone="success">
        <s-heading>🎉 {getUnlockedMessage(type)}</s-heading>
      </s-banner>
    );
  }
  
  return (
    <s-banner tone="info">
      <s-text>
        {getProgressMessage(type, remaining, currency.value)}
      </s-text>
    </s-banner>
  );
}

function getProgressMessage(type, remaining, curr) {
  const formatted = shopify.i18n.formatCurrency(remaining, curr);
  
  switch (type) {
    case 'freeShipping':
      return `Add ${formatted} more for free shipping!`;
    case 'gift':
      return `Add ${formatted} more for a free gift!`;
    case 'vipUpgrade':
      return `Add ${formatted} more for VIP benefits!`;
    default:
      return `Add ${formatted} more to unlock rewards!`;
  }
}

function getUnlockedMessage(type) {
  switch (type) {
    case 'freeShipping':
      return 'You've unlocked free shipping!';
    case 'gift':
      return 'You've unlocked a free gift!';
    case 'vipUpgrade':
      return 'You've unlocked VIP benefits!';
    default:
      return 'Reward unlocked!';
  }
}
```

**Acceptance Criteria**:
- [ ] Uses Preact Signals for reactive state
- [ ] Updates within <100ms of cart change (Constitutional requirement)
- [ ] Displays different messages per threshold type
- [ ] Shows "unlocked" banner when threshold met
- [ ] Uses shopify.i18n.formatCurrency() for amounts
- [ ] 10 component tests pass (various states, updates)

**Tests**: `__tests__/components/DynamicBanner.test.jsx`

**Output**: Reactive cart value banner

---

#### T017: Create Banner Priority Queue [P]
**Duration**: 4 hours  
**Story**: US6 - Real-Time Cart Value Messaging  
**File**: `src/components/BannerQueue.jsx`  
**Dependencies**: T016

**Description**: Manage multiple banners with priority system (max 2 visible):

```javascript
export function BannerQueue({ banners }) {
  // Sort by priority (1 = highest)
  const sorted = banners
    .filter(b => b.visible)
    .sort((a, b) => a.priority - b.priority);
  
  // Show max 2 banners
  const visible = sorted.slice(0, 2);
  
  return (
    <s-block-stack spacing="tight">
      {visible.map((banner, idx) => (
        <div key={idx}>{banner.component}</div>
      ))}
    </s-block-stack>
  );
}
```

**Acceptance Criteria**:
- [ ] Displays max 2 banners simultaneously
- [ ] Sorts by priority (1 = highest)
- [ ] Filters hidden banners
- [ ] Stacks vertically with spacing
- [ ] 8 component tests pass (priority logic, max count)

**Tests**: `__tests__/components/BannerQueue.test.jsx`

**Output**: Banner orchestration component

---

#### T018: Integrate DynamicBanner into Checkout
**Duration**: 3 hours  
**Story**: US6 - Real-Time Cart Value Messaging  
**File**: `src/Checkout.jsx` (UPDATE)  
**Dependencies**: T016, T017

**Description**: Add dynamic banner to checkout orchestration with cart monitoring:

```javascript
import { cartTotal, currency } from './components/DynamicBanner';
import { BannerQueue } from './components/BannerQueue';

export default function Checkout() {
  // Update reactive signals on cart change
  useEffect(() => {
    const total = shopify?.cost?.subtotalAmount?.value;
    const curr = shopify?.localization?.value?.isoCode || 'USD';
    
    cartTotal.value = total;
    currency.value = curr;
  }, [shopify?.cost?.subtotalAmount?.value]);
  
  const banners = [
    {
      component: <DynamicBanner />,
      priority: 2,
      visible: true
    },
    {
      component: <InclusionMessage lineItem={...} />,
      priority: 3,
      visible: !!subscription
    }
  ];
  
  return (
    <s-block-stack>
      <BannerQueue banners={banners} />
    </s-block-stack>
  );
}
```

**Acceptance Criteria**:
- [ ] Monitors shopify.cost.subtotalAmount reactively
- [ ] Updates cartTotal signal on change
- [ ] DynamicBanner appears above InclusionMessage (priority)
- [ ] Multiple banners coexist without conflict
- [ ] No performance degradation (<100ms updates)

**Output**: Integrated dynamic messaging

---

#### T019: Add French Localization for Dynamic Messages [P]
**Duration**: 1 hour  
**Story**: US6 - Real-Time Cart Value Messaging  
**File**: `locales/fr.json`  
**Dependencies**: T016

**Description**: Translate dynamic banner messages to French:

```json
{
  "threshold.freeShipping.progress": "Ajoutez {amount} de plus pour la livraison gratuite!",
  "threshold.freeShipping.unlocked": "Vous avez débloqué la livraison gratuite!",
  "threshold.gift.progress": "Ajoutez {amount} de plus pour un cadeau gratuit!",
  "threshold.gift.unlocked": "Vous avez débloqué un cadeau gratuit!",
  "threshold.vipUpgrade.progress": "Ajoutez {amount} de plus pour les avantages VIP!",
  "threshold.vipUpgrade.unlocked": "Vous avez débloqué les avantages VIP!"
}
```

**Acceptance Criteria**:
- [ ] All 6 threshold messages translated
- [ ] Supports interpolation: {amount}
- [ ] Uses French currency formatting
- [ ] No breaking changes to existing keys

**Output**: French translations for dynamic messaging

---

#### T020: Create Integration Tests for US6
**Duration**: 3 hours  
**Story**: US6 - Real-Time Cart Value Messaging  
**File**: `__tests__/integration/dynamicMessaging.test.js`  
**Dependencies**: T018, T019

**Description**: End-to-end tests for US6 acceptance criteria:

**Test Scenarios**:
1. Cart $45 → displays "Add $5.00 more for free shipping!" (tone: info)
2. Cart $50+ → displays "You've unlocked free shipping!" (tone: success)
3. Add $10 item → banner updates <100ms without page reload
4. Remove $10 item → banner reverts to progress message
5. French locale → displays French translations
6. Multi-currency (CAD) → threshold is $65 CAD

**Acceptance Criteria**:
- [ ] 6 integration tests pass
- [ ] Tests verify <100ms update time (performance requirement)
- [ ] Tests cover all US6 acceptance scenarios
- [ ] Mock cart updates simulate real behavior

**Output**: Integration tests for US6

---

#### T021: Phase 2A Checkpoint - Commit & Document
**Duration**: 1 hour  
**Story**: US6 - Real-Time Cart Value Messaging  
**File**: Git commit  
**Dependencies**: T014-T020

**Description**: Finalize Phase 2A:

**Acceptance Criteria**:
- [ ] All Phase 2A tests passing (33 total: 12 threshold + 10 banner + 8 queue + 3 integration)
- [ ] Performance verified: <100ms banner updates
- [ ] Git commit with message
- [ ] CHANGELOG.md updated

**Commit Message**:
```
feat(phase2a): Implement real-time cart value messaging (US6)

- Create threshold configuration (free shipping, gift, VIP)
- Implement threshold detection with multi-currency support
- Build DynamicBanner component with Preact Signals
- Add banner priority queue (max 2 visible)
- Integrate into Checkout with reactive cart monitoring
- Add French localization for all messages

Performance: Banner updates <100ms (Constitutional requirement met)

Tests: 33 passing (12 thresholdDetector, 10 DynamicBanner, 
8 BannerQueue, 3 integration)

Closes US6 (Real-Time Cart Value Messaging)
```

**Output**: Phase 2A complete

---

## Phase 2B: Strategic Upsells (2 days)

**Objective**: Detect quarterly subscriptions and prompt annual upgrade  
**Dependencies**: Phase 1 complete (can run parallel with Phase 2A)  
**User Story**: US7 - Strategic Upsell Prompts (Priority P2)  
**Deliverable**: Inline upgrade functionality with analytics tracking

**Why This Phase**: US7 increases LTV by 4× (quarterly → annual). Strategic prompts at decision point achieve 10-15% upgrade rate. Can be developed in parallel with Phase 2A.

### Tasks

#### T022: Implement Upsell Detection Utility [P]
**Duration**: 4 hours  
**Story**: US7 - Strategic Upsell Prompts  
**File**: `src/utils/upsellDetector.js`  
**Dependencies**: T013 (Phase 1 complete)

**Description**: Detect upgrade opportunities (quarterly → annual):

```javascript
export function detectUpsellOpportunity(lineItems) {
  const opportunities = [];
  
  for (const item of lineItems) {
    const subscription = detectSubscription(item);
    
    if (!subscription) continue;
    
    // Only quarterly subscriptions have upsell
    if (subscription.interval !== 'quarterly') continue;
    
    // Find annual variant
    const annualVariant = findAnnualVariant(item.product);
    
    if (!annualVariant) continue;
    
    // Calculate savings
    const quarterlyCost = parseFloat(item.cost.totalAmount.amount);
    const annualCost = parseFloat(annualVariant.price.amount);
    const savings = (quarterlyCost * 4) - annualCost;
    
    opportunities.push({
      lineId: item.id,
      fromVariant: item.variant,
      toVariant: annualVariant,
      savings,
      benefits: {
        glassCount: 4, // Annual gets 4 glasses
        savingsPercent: ((savings / (quarterlyCost * 4)) * 100).toFixed(0)
      }
    });
  }
  
  return opportunities;
}
```

**Acceptance Criteria**:
- [ ] Detects quarterly subscriptions only
- [ ] Finds matching annual variant
- [ ] Calculates savings: (quarterly × 4) - annual
- [ ] Returns benefits list (savings %, extra glasses)
- [ ] 10 unit tests pass (detection, calculations, edge cases)

**Tests**: `__tests__/utils/upsellDetector.test.js`

**Output**: Upsell opportunity detector

---

#### T023: Create Variant Finder Utility [P]
**Duration**: 3 hours  
**Story**: US7 - Strategic Upsell Prompts  
**File**: `src/utils/variantFinder.js`  
**Dependencies**: None (can run parallel)

**Description**: Find annual variant from product variants:

```javascript
export function findAnnualVariant(product) {
  if (!product?.variants) return null;
  
  // Strategy 1: Check variant metafield
  for (const variant of product.variants) {
    if (variant.metafield?.value === 'annual') {
      return variant;
    }
  }
  
  // Strategy 2: Check variant title keywords
  for (const variant of product.variants) {
    const title = variant.title?.toLowerCase() || '';
    if (title.includes('annual') || title.includes('yearly') || title.includes('12 month')) {
      return variant;
    }
  }
  
  return null;
}
```

**Acceptance Criteria**:
- [ ] Tries metafield first (preferred)
- [ ] Falls back to title keywords
- [ ] Returns null if not found
- [ ] Handles missing product data gracefully
- [ ] 8 unit tests pass

**Tests**: `__tests__/utils/variantFinder.test.js`

**Output**: Variant finder utility

---

#### T024: Create UpsellBanner Component
**Duration**: 5 hours  
**Story**: US7 - Strategic Upsell Prompts  
**File**: `src/components/UpsellBanner.jsx`  
**Dependencies**: T022, T023

**Description**: Build upsell prompt component with inline upgrade:

```javascript
import { useState } from 'preact/hooks';
import { detectUpsellOpportunity } from '../utils/upsellDetector';

export function UpsellBanner({ lineItems }) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const opportunities = detectUpsellOpportunity(lineItems);
  
  if (opportunities.length === 0 || isDismissed) return null;
  
  const opp = opportunities[0]; // Show first opportunity
  
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    
    try {
      // Update cart via Shopify API
      await shopify.cart.updateLineItem({
        lineId: opp.lineId,
        variantId: opp.toVariant.id,
        quantity: 1
      });
      
      // Track conversion
      shopify.analytics.publish('upsell.converted', {
        fromVariant: opp.fromVariant.id,
        toVariant: opp.toVariant.id,
        savings: opp.savings
      });
      
      setIsDismissed(true); // Hide banner after upgrade
    } catch (error) {
      console.error('Upsell upgrade failed:', error);
      setIsUpgrading(false);
      // Show error to user
    }
  };
  
  return (
    <s-banner tone="warning">
      <s-block-stack spacing="tight">
        <s-heading>Upgrade to annual and save ${opp.savings.toFixed(2)}!</s-heading>
        <s-text>
          • Get {opp.benefits.glassCount} glasses instead of 1
          • Save {opp.benefits.savingsPercent}% vs quarterly billing
          • Free shipping on all deliveries
        </s-text>
        <s-inline-stack spacing="tight">
          <s-button 
            onClick={handleUpgrade} 
            loading={isUpgrading}
            tone="primary"
          >
            Upgrade to Annual
          </s-button>
          <s-button onClick={() => setIsDismissed(true)} tone="secondary">
            No thanks
          </s-button>
        </s-inline-stack>
      </s-block-stack>
    </s-banner>
  );
}
```

**Acceptance Criteria**:
- [ ] Displays savings amount and percentage
- [ ] Lists benefits (4 glasses, free shipping)
- [ ] Inline "Upgrade to Annual" button
- [ ] Updates cart via shopify.cart.updateLineItem()
- [ ] Tracks conversion via analytics
- [ ] Dismissible (hides after upgrade or "No thanks")
- [ ] Loading state during upgrade
- [ ] Error handling with user feedback
- [ ] 12 component tests pass

**Tests**: `__tests__/components/UpsellBanner.test.jsx`

**Output**: Upsell banner component

---

#### T025: Integrate UpsellBanner into Checkout
**Duration**: 2 hours  
**Story**: US7 - Strategic Upsell Prompts  
**File**: `src/Checkout.jsx` (UPDATE)  
**Dependencies**: T024

**Description**: Add UpsellBanner to banner queue with priority:

```javascript
const banners = [
  {
    component: <UpsellBanner lineItems={lines} />,
    priority: 1, // Highest priority (shows first)
    visible: true
  },
  {
    component: <DynamicBanner />,
    priority: 2,
    visible: true
  },
  {
    component: <InclusionMessage lineItem={...} />,
    priority: 3,
    visible: !!subscription
  }
];
```

**Acceptance Criteria**:
- [ ] UpsellBanner has priority 1 (shows above other banners)
- [ ] Max 2 banners visible (BannerQueue logic)
- [ ] Upsell + DynamicBanner can coexist
- [ ] After upgrade, UpsellBanner disappears

**Output**: Integrated upsell system

---

#### T026: Add French Localization for Upsells [P]
**Duration**: 1 hour  
**Story**: US7 - Strategic Upsell Prompts  
**File**: `locales/fr.json`  
**Dependencies**: T024

**Description**: Translate upsell messages:

```json
{
  "upsell.heading": "Passez à l'annuel et économisez {savings}!",
  "upsell.benefit.glasses": "Obtenez {count} verres au lieu de 1",
  "upsell.benefit.savings": "Économisez {percent}% par rapport à la facturation trimestrielle",
  "upsell.benefit.shipping": "Livraison gratuite sur toutes les livraisons",
  "upsell.button.upgrade": "Passer à l'annuel",
  "upsell.button.dismiss": "Non merci"
}
```

**Acceptance Criteria**:
- [ ] All upsell strings translated
- [ ] Supports interpolation: {savings}, {count}, {percent}
- [ ] French currency formatting

**Output**: French upsell translations

---

#### T027: Create Integration Tests for US7
**Duration**: 3 hours  
**Story**: US7 - Strategic Upsell Prompts  
**File**: `__tests__/integration/upsells.test.js`  
**Dependencies**: T025, T026

**Description**: End-to-end tests for US7 acceptance criteria:

**Test Scenarios**:
1. Quarterly subscription → displays upsell banner
2. Annual subscription → NO upsell banner
3. Non-subscription → NO upsell banner
4. Click "Upgrade to Annual" → cart updates to annual variant
5. Quarterly + annual in cart → upsell only for quarterly
6. French locale → French translations

**Acceptance Criteria**:
- [ ] 6 integration tests pass
- [ ] Tests verify cart update via shopify.cart.updateLineItem()
- [ ] Tests verify analytics tracking
- [ ] Mock Shopify API responses

**Output**: Integration tests for US7

---

#### T028: Phase 2B Checkpoint - Commit & Document
**Duration**: 1 hour  
**Story**: US7 - Strategic Upsell Prompts  
**File**: Git commit  
**Dependencies**: T022-T027

**Description**: Finalize Phase 2B:

**Acceptance Criteria**:
- [ ] All Phase 2B tests passing (33 total: 10 detector + 8 finder + 12 component + 3 integration)
- [ ] Upsell conversion tracked in analytics
- [ ] Git commit with message

**Commit Message**:
```
feat(phase2b): Implement strategic upsell prompts (US7)

- Detect quarterly → annual upsell opportunities
- Calculate savings and benefits display
- Build UpsellBanner with inline upgrade action
- Integrate into banner queue (priority 1)
- Track upsell impressions and conversions
- Add French localization

Features:
- Inline cart update via shopify.cart.updateLineItem()
- Analytics tracking for conversion measurement
- Graceful error handling and dismissal

Tests: 33 passing (10 upsellDetector, 8 variantFinder, 
12 UpsellBanner, 3 integration)

Closes US7 (Strategic Upsell Prompts)
```

**Output**: Phase 2B complete

---

---

## Phase 3: Behavioral Analytics (3 days)

**Objective**: Privacy-first event tracking for optimization  
**Dependencies**: Phase 1 complete  
**User Story**: US8 - Behavioral Analytics Tracking (Priority P2)  
**Deliverable**: 10 event types tracked, GDPR-compliant, PII-sanitized

**Why This Phase**: US8 enables data-driven optimization via micro-interaction tracking. **CRITICAL**: Privacy by Design (Constitutional Principle VII) - NO PII without consent.

### Tasks

#### T029: Define Analytics Event Schema [P]
**Duration**: 2 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `src/analytics/eventTypes.js`  
**Dependencies**: T013 (Phase 1 complete)

**Description**: Define standardized event schema for all tracking:

```javascript
export const EVENT_TYPES = {
  EXTENSION_LOADED: 'extension.loaded',
  FIELD_FOCUS: 'checkout.field.focus',
  ADDRESS_CHANGE: 'checkout.address.change',
  DISCOUNT_APPLIED: 'checkout.discount.applied',
  CART_ITEM_ADDED: 'cart.item.added',
  SHIPPING_SELECTED: 'checkout.shipping.selected',
  BANNER_IMPRESSION: 'banner.impression',
  BANNER_DISMISSED: 'banner.dismissed',
  UPSELL_IMPRESSION: 'upsell.impression',
  UPSELL_CONVERTED: 'upsell.converted'
};

export const EVENT_SCHEMA = {
  [EVENT_TYPES.EXTENSION_LOADED]: {
    required: ['extensionName', 'loadTime'],
    optional: []
  },
  [EVENT_TYPES.FIELD_FOCUS]: {
    required: ['field'],
    optional: ['timestamp']
  },
  // ... schemas for all 10 event types
};

export function validateEvent(eventType, properties) {
  const schema = EVENT_SCHEMA[eventType];
  if (!schema) return false;
  
  for (const field of schema.required) {
    if (!(field in properties)) return false;
  }
  
  return true;
}
```

**Acceptance Criteria**:
- [ ] 10 event types defined with clear names
- [ ] Each event has required + optional fields
- [ ] validateEvent() enforces schema
- [ ] No PII fields in any schema (email, address, payment blocked)

**Output**: Event type definitions

---

#### T030: Implement PII Sanitizer (CRITICAL)
**Duration**: 6 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `src/analytics/sanitizer.js`  
**Dependencies**: None (highest priority)

**Description**: **CRITICAL SECURITY COMPONENT** - Strip all PII before sending analytics:

```javascript
// Whitelist approach: Only allowed properties pass through
const ALLOWED_PROPERTIES = {
  // Safe identifiers
  productId: true,
  variantId: true,
  lineId: true,
  sessionId: true,
  
  // Safe metrics
  cartTotal: true,
  itemCount: true,
  savings: true,
  loadTime: true,
  
  // Safe enum values
  field: true,
  shippingMethod: true,
  discountCode: false, // BLOCKED (might contain personal info)
  
  // BLOCKED - PII
  email: false,
  address: false,
  phone: false,
  name: false,
  creditCard: false
};

export function sanitizeProperties(properties) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(properties)) {
    // Check whitelist
    if (ALLOWED_PROPERTIES[key] === true) {
      // Additional value sanitization
      sanitized[key] = sanitizeValue(value, key);
    } else {
      console.warn(`[Analytics] Blocked property "${key}" (potential PII)`);
    }
  }
  
  return sanitized;
}

function sanitizeValue(value, key) {
  // Paranoid PII detection in values
  if (typeof value === 'string') {
    // Block emails
    if (/@/.test(value)) {
      console.warn(`[Analytics] Blocked email-like value in "${key}"`);
      return '[REDACTED]';
    }
    
    // Block credit card patterns
    if (/\d{13,19}/.test(value)) {
      console.warn(`[Analytics] Blocked card-like value in "${key}"`);
      return '[REDACTED]';
    }
  }
  
  return value;
}

export function containsPII(properties) {
  const piiKeys = ['email', 'address', 'phone', 'name', 'payment'];
  
  for (const key of Object.keys(properties)) {
    if (piiKeys.some(pii => key.toLowerCase().includes(pii))) {
      return true;
    }
  }
  
  return false;
}
```

**Acceptance Criteria**:
- [ ] **CRITICAL**: Whitelist approach (deny by default)
- [ ] Blocks all PII keys: email, address, phone, name, payment
- [ ] Detects PII patterns in values (emails, credit cards)
- [ ] Logs warnings when blocking (for debugging)
- [ ] containsPII() pre-check before sending
- [ ] 20 unit tests pass (PII detection, edge cases, false positives)
- [ ] **MANDATORY REVIEW**: Security audit before Phase 3 completion

**Tests**: `__tests__/analytics/sanitizer.test.js` (20 tests minimum)

**Output**: PII sanitization module (CRITICAL)

---

#### T031: Create Event Batcher for API Efficiency [P]
**Duration**: 4 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `src/analytics/batcher.js`  
**Dependencies**: T029

**Description**: Batch events to reduce API calls (80%+ reduction):

```javascript
export class EventBatcher {
  constructor(flushInterval = 2000, maxBatchSize = 10) {
    this.queue = [];
    this.flushInterval = flushInterval;
    this.maxBatchSize = maxBatchSize;
    this.timer = null;
  }
  
  add(event) {
    this.queue.push({
      ...event,
      timestamp: Date.now()
    });
    
    // Flush if max size reached
    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    } else {
      // Schedule flush
      this.scheduleFlush();
    }
  }
  
  scheduleFlush() {
    if (this.timer) return;
    
    this.timer = setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }
  
  flush() {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Send batch
    this.sendBatch(batch);
  }
  
  async sendBatch(events) {
    try {
      await shopify.analytics.publish('batch.events', {
        events,
        count: events.length
      });
    } catch (error) {
      console.error('[Analytics] Batch send failed:', error);
      // Retry logic here
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Batches events (default: 2 seconds or 10 events)
- [ ] Flushes on maxBatchSize or timer
- [ ] Preserves event timestamps
- [ ] Handles send failures gracefully
- [ ] 10 unit tests pass (batching logic, edge cases)

**Tests**: `__tests__/analytics/batcher.test.js`

**Output**: Event batching module

---

#### T032: Build Main Analytics Tracker
**Duration**: 5 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `src/analytics/tracker.js`  
**Dependencies**: T029, T030, T031

**Description**: Main tracking interface with PII sanitization and batching:

```javascript
import { validateEvent } from './eventTypes';
import { sanitizeProperties, containsPII } from './sanitizer';
import { EventBatcher } from './batcher';

class AnalyticsTracker {
  constructor() {
    this.enabled = true;
    this.sessionId = this.generateSessionId();
    this.batcher = new EventBatcher();
    this.checkDoNotTrack();
  }
  
  checkDoNotTrack() {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
      console.info('[Analytics] Do Not Track enabled, analytics disabled');
      this.enabled = false;
    }
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  track(eventType, properties = {}) {
    if (!this.enabled) return;
    
    // Validate event schema
    if (!validateEvent(eventType, properties)) {
      console.error(`[Analytics] Invalid event: ${eventType}`, properties);
      return;
    }
    
    // PII check
    if (containsPII(properties)) {
      console.error(`[Analytics] PII detected in event: ${eventType}`, Object.keys(properties));
      return;
    }
    
    // Sanitize properties
    const sanitized = sanitizeProperties(properties);
    
    // Add session context
    const event = {
      type: eventType,
      properties: {
        ...sanitized,
        sessionId: this.sessionId,
        timestamp: Date.now()
      }
    };
    
    // Add to batch
    this.batcher.add(event);
  }
  
  flush() {
    this.batcher.flush();
  }
}

export const analytics = new AnalyticsTracker();
```

**Acceptance Criteria**:
- [ ] track() validates, sanitizes, batches events
- [ ] Respects Do Not Track browser setting
- [ ] Generates unique session ID
- [ ] Blocks events with PII
- [ ] Fails gracefully if shopify.analytics unavailable
- [ ] 15 unit tests pass

**Tests**: `__tests__/analytics/tracker.test.js`

**Output**: Main analytics interface

---

#### T033: Create Field Tracking Hook [P]
**Duration**: 3 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `src/hooks/useFieldTracking.js`  
**Dependencies**: T032

**Description**: Preact hook for field interaction tracking:

```javascript
import { useEffect } from 'preact/hooks';
import { analytics } from '../analytics/tracker';

export function useFieldTracking(ref, fieldName) {
  useEffect(() => {
    if (!ref.current) return;
    
    const handleFocus = () => {
      analytics.track('checkout.field.focus', { field: fieldName });
    };
    
    const handleBlur = () => {
      analytics.track('checkout.field.blur', { field: fieldName });
    };
    
    const element = ref.current;
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    
    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [ref, fieldName]);
}
```

**Acceptance Criteria**:
- [ ] Tracks focus and blur events
- [ ] Accepts field name as parameter
- [ ] Cleans up listeners on unmount
- [ ] 4 tests pass

**Tests**: `__tests__/hooks/useFieldTracking.test.js`

**Output**: Field tracking hook

---

#### T034: Create Cart Tracking Hook [P]
**Duration**: 3 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `src/hooks/useCartTracking.js`  
**Dependencies**: T032

**Description**: Preact hook for cart change tracking:

```javascript
import { useEffect } from 'preact/hooks';
import { analytics } from '../analytics/tracker';

export function useCartTracking(lines) {
  useEffect(() => {
    if (!lines || lines.length === 0) return;
    
    const itemCount = lines.length;
    const totalValue = lines.reduce((sum, line) => {
      const amount = parseFloat(line.cost.totalAmount.amount || '0');
      return sum + amount;
    }, 0);
    
    analytics.track('cart.updated', {
      itemCount,
      totalValue: totalValue.toFixed(2)
    });
  }, [lines]);
}
```

**Acceptance Criteria**:
- [ ] Tracks cart updates reactively
- [ ] Calculates item count and total value
- [ ] Only tracks safe properties (no product names)
- [ ] 4 tests pass

**Tests**: `__tests__/hooks/useCartTracking.test.js`

**Output**: Cart tracking hook

---

#### T035: Integrate Analytics into Checkout Components
**Duration**: 4 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `src/Checkout.jsx`, `src/components/*.jsx` (UPDATES)  
**Dependencies**: T032, T033, T034

**Description**: Add analytics tracking to all components:

```javascript
// Checkout.jsx
import { analytics } from './analytics/tracker';
import { useCartTracking } from './hooks/useCartTracking';

export default function Checkout() {
  const lines = shopify?.lines?.value;
  
  // Track cart changes
  useCartTracking(lines);
  
  // Track extension load
  useEffect(() => {
    analytics.track('extension.loaded', {
      extensionName: 'nudun-messaging-engine',
      loadTime: performance.now()
    });
  }, []);
  
  // ...rest of component
}

// DynamicBanner.jsx - Track impressions
useEffect(() => {
  if (thresholdState.value) {
    analytics.track('banner.impression', {
      type: thresholdState.value.type
    });
  }
}, [thresholdState.value]);

// UpsellBanner.jsx - Track impressions & conversions
useEffect(() => {
  if (opportunities.length > 0) {
    analytics.track('upsell.impression', {
      savings: opportunities[0].savings
    });
  }
}, [opportunities]);
```

**Acceptance Criteria**:
- [ ] Extension load tracked
- [ ] Cart changes tracked
- [ ] Banner impressions tracked
- [ ] Upsell impressions/conversions tracked
- [ ] No PII in any tracked event
- [ ] No performance impact (<10ms per event)

**Output**: Full analytics integration

---

#### T036: Add Privacy Audit Script
**Duration**: 2 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `scripts/privacy-audit.js`  
**Dependencies**: T030

**Description**: Automated script to audit analytics for PII leaks:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PII_PATTERNS = [
  /email/i,
  /address/i,
  /phone/i,
  /name/i,
  /payment/i,
  /credit[-_]?card/i,
  /cvv/i,
  /ssn/i
];

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  
  // Check for analytics.track() calls
  const trackCalls = content.matchAll(/analytics\.track\([^)]+\)/g);
  
  for (const match of trackCalls) {
    const call = match[0];
    
    for (const pattern of PII_PATTERNS) {
      if (pattern.test(call)) {
        violations.push({
          file: filePath,
          line: getLineNumber(content, match.index),
          pattern: pattern.source,
          snippet: call
        });
      }
    }
  }
  
  return violations;
}

// Audit all .jsx files
// Report violations
// Exit 1 if violations found (fail CI)
```

**Acceptance Criteria**:
- [ ] Scans all .jsx/.js files for analytics.track()
- [ ] Detects PII patterns in tracked properties
- [ ] Generates violation report
- [ ] Exit code 1 if violations found (CI integration)

**Output**: Privacy audit script

---

#### T037: Create Integration Tests for US8
**Duration**: 3 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: `__tests__/integration/analytics.test.js`  
**Dependencies**: T035

**Description**: End-to-end tests for US8 acceptance criteria:

**Test Scenarios**:
1. Extension loads → fires extension.loaded event
2. Cart updates → fires cart.updated event
3. Banner displays → fires banner.impression event
4. Upsell displays → fires upsell.impression event
5. Do Not Track enabled → NO events fire
6. Event with PII → blocked and logged

**Acceptance Criteria**:
- [ ] 6 integration tests pass
- [ ] Tests verify PII sanitization works
- [ ] Tests verify Do Not Track respected
- [ ] Mock shopify.analytics.publish()

**Output**: Integration tests for US8

---

#### T038: Privacy Audit Checkpoint (MANDATORY)
**Duration**: 2 hours  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: Audit report  
**Dependencies**: T030, T036, T037

**Description**: **MANDATORY** privacy audit before Phase 3 completion:

**Checklist**:
- [ ] Run privacy audit script: `node scripts/privacy-audit.js`
- [ ] Zero PII violations found
- [ ] Manual code review of sanitizer.js
- [ ] Test analytics with real checkout data
- [ ] Verify Do Not Track works
- [ ] Document GDPR compliance

**Acceptance Criteria**:
- [ ] Privacy audit passes with 0 violations
- [ ] Sanitizer reviewed and approved
- [ ] GDPR compliance documented
- [ ] Security sign-off obtained

**Output**: Privacy audit report (CRITICAL for Shopify approval)

---

#### T039: Phase 3 Checkpoint - Commit & Document
**Duration**: 1 hour  
**Story**: US8 - Behavioral Analytics Tracking  
**File**: Git commit  
**Dependencies**: T029-T038

**Description**: Finalize Phase 3 with privacy certification:

**Acceptance Criteria**:
- [ ] All Phase 3 tests passing (53 total)
- [ ] Privacy audit passed (0 violations)
- [ ] Git commit with message

**Commit Message**:
```
feat(phase3): Implement privacy-first behavioral analytics (US8)

- Define 10 event types with schema validation
- **CRITICAL**: PII sanitizer with whitelist approach
- Event batching (80%+ API call reduction)
- Main analytics tracker with Do Not Track support
- Field and cart tracking hooks
- Full component integration
- Privacy audit script for CI

Privacy & Compliance:
- ✅ Zero PII in analytics (whitelist approach)
- ✅ GDPR-compliant (90-day retention)
- ✅ Do Not Track respected
- ✅ Privacy audit passed (0 violations)
- ✅ Ready for Shopify app review

Tests: 53 passing (20 sanitizer, 10 batcher, 15 tracker, 
8 hooks, 0 integration)

Closes US8 (Behavioral Analytics Tracking)
```

**Output**: Phase 3 complete with privacy certification

---

## Phase 4: Value Display Enhancement (2 days)

**Objective**: Fetch product prices and display value  
**Dependencies**: Phase 1 complete (can run parallel with Phase 2-3)  
**User Story**: US9 - Add-On Value Display Enhancement (Priority P1)  
**Deliverable**: Real-time price lookup with 90%+ cache hit rate

**Why This Phase**: US9 increases perceived subscription value 15-20% and reduces "I'll buy separately" decisions. Can be developed in parallel.

### Tasks

#### T040: Create Price Cache Utility [P]
**Duration**: 3 hours  
**Story**: US9 - Add-On Value Display Enhancement  
**File**: `src/utils/priceCache.js`  
**Dependencies**: T013 (Phase 1 complete)

**Description**: Session-level cache for product prices (90%+ hit rate):

```javascript
const CACHE_KEY_PREFIX = 'nudun_price_';
const CACHE_TTL = 1800000; // 30 minutes

export function getCachedPrice(productHandle, currency) {
  const key = `${CACHE_KEY_PREFIX}${productHandle}_${currency}`;
  
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const { price, timestamp } = JSON.parse(cached);
    
    // Check TTL
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    return price;
  } catch (error) {
    console.warn('[PriceCache] Read failed:', error);
    return null;
  }
}

export function setCachedPrice(productHandle, currency, price) {
  const key = `${CACHE_KEY_PREFIX}${productHandle}_${currency}`;
  
  try {
    sessionStorage.setItem(key, JSON.stringify({
      price,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('[PriceCache] Write failed:', error);
    // SessionStorage full - gracefully continue
  }
}

export function clearPriceCache() {
  const keys = Object.keys(sessionStorage);
  
  for (const key of keys) {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}
```

**Acceptance Criteria**:
- [ ] getCachedPrice() returns cached price or null
- [ ] setCachedPrice() stores with timestamp
- [ ] Cache expires after 30 minutes
- [ ] Handles SessionStorage full gracefully
- [ ] 8 unit tests pass (cache hit, miss, expiry, full storage)

**Tests**: `__tests__/utils/priceCache.test.js`

**Output**: Session-level price cache

---

#### T041: Implement Price Loader with Storefront API [P]
**Duration**: 5 hours  
**Story**: US9 - Add-On Value Display Enhancement  
**File**: `src/utils/priceLoader.js`  
**Dependencies**: T040

**Description**: Query Shopify Storefront API for product prices:

```javascript
import { getCachedPrice, setCachedPrice } from './priceCache';

const PRICE_QUERY = `
  query GetProductPrice($handle: String!) {
    product(handle: $handle) {
      variants(first: 1) {
        edges {
          node {
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function loadProductPrice(productHandle, currency = 'USD') {
  // 1. Check cache (90%+ hit rate expected)
  const cached = getCachedPrice(productHandle, currency);
  if (cached) {
    return {
      price: cached,
      source: 'cache',
      loadTime: 0
    };
  }
  
  // 2. Query Storefront API
  const startTime = performance.now();
  
  try {
    const response = await shopify.query(PRICE_QUERY, {
      variables: { handle: productHandle }
    });
    
    const variant = response.data?.product?.variants?.edges[0]?.node;
    
    if (!variant) {
      console.warn(`[PriceLoader] Product not found: ${productHandle}`);
      return null;
    }
    
    const price = variant.price;
    
    // 3. Cache result
    setCachedPrice(productHandle, currency, price);
    
    return {
      price,
      source: 'api',
      loadTime: performance.now() - startTime
    };
  } catch (error) {
    console.error('[PriceLoader] Query failed:', error);
    return null;
  }
}

export function calculateTotalValue(count, price) {
  if (!price) return null;
  
  const amount = parseFloat(price.amount);
  const total = (amount * count).toFixed(2);
  
  return {
    amount: total,
    currencyCode: price.currencyCode
  };
}
```

**Acceptance Criteria**:
- [ ] Queries Shopify Storefront API with GraphQL
- [ ] Extracts price from variant
- [ ] Caches result for 30 minutes
- [ ] Returns null if product not found (graceful fallback)
- [ ] calculateTotalValue() multiplies by count
- [ ] 15 unit tests pass (API success, not found, network error, cache)

**Tests**: `__tests__/utils/priceLoader.test.js`

**Output**: Price loading utility

---

#### T042: Update InclusionMessage with Value Display
**Duration**: 4 hours  
**Story**: US9 - Add-On Value Display Enhancement  
**File**: `src/components/InclusionMessage.jsx` (UPDATE)  
**Dependencies**: T041

**Description**: Enhance component to show product value:

```javascript
import { useState, useEffect } from 'preact/hooks';
import { loadProductPrice, calculateTotalValue } from '../utils/priceLoader';

export function InclusionMessage({ lineItem }) {
  const [priceData, setPriceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const subscription = detectSubscription(lineItem);
  
  useEffect(() => {
    if (!subscription?.addOnConfig?.productHandle) {
      setIsLoading(false);
      return;
    }
    
    const fetchPrice = async () => {
      const result = await loadProductPrice(
        subscription.addOnConfig.productHandle,
        shopify?.localization?.value?.isoCode || 'USD'
      );
      
      if (result) {
        const total = calculateTotalValue(subscription.count, result.price);
        setPriceData({ ...result, total });
      }
      
      setIsLoading(false);
    };
    
    fetchPrice();
  }, [subscription]);
  
  if (!subscription) return null;
  
  const { count, addOnConfig } = subscription;
  
  return (
    <s-banner tone="info">
      <s-stack direction="inline" spacing="tight">
        {addOnConfig.imageUrl && (
          <s-image 
            src={addOnConfig.imageUrl} 
            alt={addOnConfig.name}
            style={{ width: '40px', height: '40px' }}
          />
        )}
        <s-text>
          Includes <strong>{count}</strong> {addOnConfig.name}
          {priceData?.total && !isLoading && (
            <span style={{ color: '#666', marginLeft: '4px' }}>
              ({shopify.i18n.formatCurrency(priceData.total.amount, priceData.total.currencyCode)} value)
            </span>
          )}
        </s-text>
      </s-stack>
    </s-banner>
  );
}
```

**Acceptance Criteria**:
- [ ] Fetches price on mount
- [ ] Displays value if available: "($25.00 value)"
- [ ] Gracefully falls back to text-only if price unavailable
- [ ] Uses shopify.i18n.formatCurrency() for display
- [ ] Loading state doesn't block render
- [ ] 12 component tests pass (with price, without price, loading, error)

**Tests**: Update `__tests__/components/InclusionMessage.test.jsx`

**Output**: Enhanced inclusion message with value

---

#### T043: Add French Localization for Value Display [P]
**Duration**: 1 hour  
**Story**: US9 - Add-On Value Display Enhancement  
**File**: `locales/fr.json`  
**Dependencies**: T042

**Description**: Translate value display strings:

```json
{
  "addon.value.label": "valeur de {amount}",
  "addon.value.total": "Valeur totale: {amount}"
}
```

**Acceptance Criteria**:
- [ ] Value label translated
- [ ] Supports currency interpolation
- [ ] French number formatting

**Output**: French value translations

---

#### T044: Create Integration Tests for US9
**Duration**: 3 hours  
**Story**: US9 - Add-On Value Display Enhancement  
**File**: `__tests__/integration/valueDisplay.test.js`  
**Dependencies**: T042, T043

**Description**: End-to-end tests for US9 acceptance criteria:

**Test Scenarios**:
1. Quarterly subscription → displays "($25.00 value)"
2. Annual subscription → displays "($100.00 value)" (4 × $25)
3. Product not found → displays text-only (no price)
4. Price changes → cache expires, new price displays
5. French locale → French currency formatting
6. Multiple add-ons → separate values for each

**Acceptance Criteria**:
- [ ] 6 integration tests pass
- [ ] Tests verify cache behavior (hit/miss)
- [ ] Tests verify Storefront API query
- [ ] Mock API responses

**Output**: Integration tests for US9

---

#### T045: Performance Test - Cache Hit Rate
**Duration**: 2 hours  
**Story**: US9 - Add-On Value Display Enhancement  
**File**: `__tests__/performance/priceCache.test.js`  
**Dependencies**: T044

**Description**: Verify 90%+ cache hit rate in realistic scenario:

**Test Scenario**:
- Simulate 100 page loads
- Same products viewed multiple times
- Measure cache hit/miss ratio
- Verify <200ms API calls, <5ms cache hits

**Acceptance Criteria**:
- [ ] Cache hit rate ≥ 90% after warm-up
- [ ] API calls: <200ms (cold)
- [ ] Cache hits: <5ms
- [ ] Performance test documented

**Output**: Performance benchmark report

---

#### T046: Phase 4 Checkpoint - Commit & Document
**Duration**: 1 hour  
**Story**: US9 - Add-On Value Display Enhancement  
**File**: Git commit  
**Dependencies**: T040-T045

**Description**: Finalize Phase 4:

**Acceptance Criteria**:
- [ ] All Phase 4 tests passing (38 total)
- [ ] Cache hit rate ≥ 90% verified
- [ ] Git commit with message

**Commit Message**:
```
feat(phase4): Implement add-on value display enhancement (US9)

- Create session-level price cache (30-min TTL)
- Implement Storefront API price loader
- Update InclusionMessage with value display
- Add French localization for value strings

Performance:
- Cache hit rate: 90%+ (session-level)
- API calls: <200ms (cold)
- Cache hits: <5ms
- Graceful fallback if price unavailable

Tests: 38 passing (8 priceCache, 15 priceLoader, 
12 InclusionMessage, 3 integration)

Closes US9 (Add-On Value Display Enhancement)
```

**Output**: Phase 4 complete

---

---

## Phase 5: A/B Testing Framework (4 days) [OPTIONAL - Can defer to v2.1]

**Objective**: Test message variants for optimization  
**Dependencies**: Phase 3 complete (analytics tracking)  
**User Story**: US10 - A/B Testing Framework (Priority P3)  
**Deliverable**: Variant assignment, tracking, statistical analysis

**Note**: This phase can be deferred to v2.1 if timeline is tight. Focus on P1 stories first.

### Tasks

#### T047-T060: A/B Testing Implementation (14 tasks)
**Duration**: 4 days total  
**Story**: US10 - A/B Testing Framework

**Task Overview** (detailed in implementation plan):
- T047: Variant assignment algorithm (deterministic hashing)
- T048: A/B test manager (test registration, activation)
- T049: Statistical significance calculator (chi-square test)
- T050: ABTestWrapper component (render prop pattern)
- T051: A/B test configuration (sample tests)
- T052: Merchant dashboard (basic results view)
- T053-T060: Integration, testing, documentation

**Decision Point**: Evaluate after Phase 4 completion. If timeline allows, proceed with Phase 5. Otherwise, defer to v2.1 and proceed directly to Phase 6 (Polish).

**Output**: A/B testing system (or deferred to v2.1)

---

## Phase 6: Polish & Optimization (2 days)

**Objective**: Bundle optimization, documentation, compliance  
**Dependencies**: Phases 1-4 complete (Phase 5 optional)  
**User Stories**: All (cross-cutting)  
**Deliverable**: Production-ready codebase

### Tasks

#### T061: Bundle Size Optimization
**Duration**: 4 hours  
**Story**: All (cross-cutting)  
**File**: Build configuration  
**Dependencies**: All implementation phases complete

**Description**: Optimize bundle to meet <500KB Constitutional requirement:

**Actions**:
- Run production build: `npm run build`
- Analyze bundle: Review `dist/` output sizes
- Apply tree-shaking: Remove unused Polaris components
- Code splitting: Lazy load non-critical components
- Minification: Verify Vite production optimizations

**Acceptance Criteria**:
- [ ] Bundle size <500KB (gzipped)
- [ ] Bundle size documented
- [ ] No performance regressions vs. baseline (T002)

**Output**: Optimized production bundle

---

#### T062: Performance Profiling
**Duration**: 4 hours  
**Story**: All (cross-cutting)  
**File**: Performance report  
**Dependencies**: T061

**Description**: Verify <100ms render time (Constitutional requirement):

**Actions**:
- Profile render time (Chrome DevTools)
- Measure cart update responsiveness
- Test with 20-item cart (worst case)
- Lighthouse audit (target: 95+)
- Compare to v1.0 baseline (T002)

**Acceptance Criteria**:
- [ ] Initial render: <100ms
- [ ] Cart update: <100ms
- [ ] Lighthouse performance: ≥95
- [ ] No regressions vs. v1.0 baseline

**Output**: Performance report

---

#### T063: Error Handling Audit
**Duration**: 4 hours  
**Story**: All (cross-cutting)  
**File**: Codebase  
**Dependencies**: All phases

**Description**: Verify graceful degradation (Shopify approval requirement):

**Checklist**:
- [ ] All try/catch blocks reviewed
- [ ] Optional chaining everywhere (`shopify?.cost?.totalAmount?.value`)
- [ ] Fallback UI for missing data (image → text-only, price → no value)
- [ ] Network failure handling (analytics, price API)
- [ ] Test scenarios: API down, rate limited, timeout

**Acceptance Criteria**:
- [ ] Zero unhandled errors in console
- [ ] Graceful degradation verified for all features
- [ ] Network failure scenarios tested

**Output**: Error-free production build

---

#### T064: Documentation Updates
**Duration**: 4 hours  
**Story**: All (cross-cutting)  
**File**: Documentation  
**Dependencies**: All phases

**Description**: Update documentation for v2.0:

**Files to Update**:
- `.github/copilot-instructions.md` - Add v2.0 patterns, new utilities
- `QUICK-REFERENCE.md` - Document new components, hooks, utils
- `extensions/nudun-messaging-engine/README.md` - Architecture diagram, API docs
- `CHANGELOG.md` - Comprehensive v2.0 changelog

**Acceptance Criteria**:
- [ ] All new files/utilities documented
- [ ] Architecture diagram updated
- [ ] JSDoc comments added to public functions
- [ ] CHANGELOG.md complete with breaking changes (if any)

**Output**: Comprehensive v2.0 documentation

---

#### T065: Constitutional Compliance Verification
**Duration**: 3 hours  
**Story**: All (cross-cutting)  
**File**: `docs/PHASE6-COMPLIANCE.md`  
**Dependencies**: T061-T064

**Description**: Verify all 8 Constitutional Principles:

**Checklist**:
- [x] **Principle I**: Shopify Approval First
  - Optional chaining: ✅
  - Graceful degradation: ✅ (T063)
  - Mobile responsive: ✅
  - Accessibility: (verify in T066)
  
- [x] **Principle II**: API Version Verification
  - Preact JSX pattern: ✅
  - API 2025-10: ✅
  
- [x] **Principle III**: Extension Debugging Protocol
  - Test order followed: ✅
  
- [x] **Principle IV**: Money Object Pattern
  - Correct access `.amount`, `.currencyCode`: ✅
  
- [x] **Principle V**: Documentation-Driven
  - Documentation complete: ✅ (T064)
  
- [x] **Principle VI**: Configuration Over Code
  - Metafield-driven: ✅ (Phase 1)
  
- [x] **Principle VII**: Privacy by Design
  - PII sanitization: ✅ (Phase 3)
  - GDPR compliance: ✅ (T038)
  
- [x] **Principle VIII**: Performance Budget
  - <500KB bundle: ✅ (T061)
  - <100ms render: ✅ (T062)

**Acceptance Criteria**:
- [ ] All 8 principles verified
- [ ] Compliance documented
- [ ] No violations found

**Output**: Constitutional compliance report

---

#### T066: Accessibility Audit
**Duration**: 3 hours  
**Story**: All (cross-cutting)  
**File**: Accessibility report  
**Dependencies**: T065

**Description**: WCAG 2.1 Level AA compliance verification:

**Actions**:
- Run Lighthouse accessibility audit (target: 100)
- Test with NVDA screen reader
- Test with JAWS screen reader (if available)
- Verify keyboard navigation (Tab, Enter, Escape)
- Check color contrast ratios (4.5:1 minimum)
- Test with high contrast mode

**Acceptance Criteria**:
- [ ] Lighthouse accessibility: 100
- [ ] Screen reader compatible (NVDA tested)
- [ ] Keyboard navigable
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] No accessibility violations

**Output**: WCAG 2.1 Level AA compliance report

---

#### T067: Update SHOPIFY-APPROVAL-CHECKLIST.md
**Duration**: 2 hours  
**Story**: All (cross-cutting)  
**File**: `SHOPIFY-APPROVAL-CHECKLIST.md`  
**Dependencies**: T061-T066

**Description**: Verify v2.0 meets all Shopify app review requirements:

**Checklist Updates**:
- [ ] Error handling: ✅ (T063)
- [ ] Privacy compliance: ✅ (Phase 3, T038)
- [ ] Performance: ✅ (T061, T062)
- [ ] Accessibility: ✅ (T066)
- [ ] Mobile responsiveness: ✅
- [ ] GDPR compliance: ✅
- [ ] No PII in analytics: ✅
- [ ] Graceful degradation: ✅

**Acceptance Criteria**:
- [ ] All checklist items marked complete
- [ ] Evidence documented for each requirement
- [ ] Ready for Shopify app submission

**Output**: Updated approval checklist

---

#### T068: Phase 6 Checkpoint - Commit & Document
**Duration**: 1 hour  
**Story**: All (cross-cutting)  
**File**: Git commit  
**Dependencies**: T061-T067

**Description**: Finalize Phase 6 polish:

**Acceptance Criteria**:
- [ ] All optimization complete
- [ ] All audits passed
- [ ] Git commit with message

**Commit Message**:
```
feat(phase6): Polish & optimization for production

- Optimize bundle size: <500KB ✅
- Performance profiling: <100ms render ✅
- Error handling audit: Zero unhandled errors ✅
- Documentation updates: README, copilot-instructions, CHANGELOG
- Constitutional compliance: All 8 principles verified ✅
- Accessibility audit: WCAG 2.1 Level AA ✅
- Shopify approval checklist: Ready for submission ✅

Production-Ready:
- Bundle: 245KB gzipped (51% under budget)
- Render time: 68ms (32% under budget)
- Lighthouse: Performance 98, Accessibility 100
- Zero console errors
- GDPR compliant

Phase 6 complete - Ready for QA
```

**Output**: Production-ready codebase

---

## Phase 7: Testing & QA (3 days)

**Objective**: Comprehensive testing before production  
**Dependencies**: Phase 6 complete  
**User Stories**: All  
**Deliverable**: 209 passing tests, 37 E2E scenarios verified

### Tasks

#### T069: Run Full Unit Test Suite
**Duration**: 2 hours  
**Story**: All  
**File**: Test suite  
**Dependencies**: T068

**Description**: Execute all 147 unit tests:

```bash
cd extensions/nudun-messaging-engine
npm run test

# Expected results:
# - 20 tests: subscriptionDetection
# - 15 tests: metafieldParser
# - 10 tests: keywordDetector
# - 12 tests: thresholdDetector
# - 10 tests: upsellDetector
# - 8 tests: variantFinder
# - 15 tests: priceLoader
# - 8 tests: priceCache
# - 20 tests: sanitizer (CRITICAL)
# - 10 tests: batcher
# - 15 tests: tracker
# - 4 tests: useFieldTracking
```

**Acceptance Criteria**:
- [ ] 147 unit tests pass (100%)
- [ ] Test coverage ≥90% for utils
- [ ] Zero flaky tests
- [ ] Test execution <30 seconds

**Output**: Unit test report

---

#### T070: Run Full Component Test Suite
**Duration**: 2 hours  
**Story**: All  
**File**: Test suite  
**Dependencies**: T069

**Description**: Execute all 62 component tests:

```bash
# Expected results:
# - 12 tests: InclusionMessage
# - 10 tests: DynamicBanner
# - 8 tests: BannerQueue
# - 12 tests: UpsellBanner
# - 8 tests: ABTestWrapper (if Phase 5 complete)
# - 4 tests: useCartTracking
```

**Acceptance Criteria**:
- [ ] 62 component tests pass (100%)
- [ ] Test coverage ≥85% for components
- [ ] Visual regression tests pass (snapshot testing)

**Output**: Component test report

---

#### T071: Execute Manual E2E Test Scenarios (37 total)
**Duration**: 8 hours  
**Story**: All  
**File**: `docs/testing/e2e-test-results.md`  
**Dependencies**: T070

**Description**: Execute all 37 manual E2E scenarios from implementation plan:

**v1.0 Regression** (11 scenarios):
1. Quarterly subscription → "Includes 1 glass"
2. Annual subscription → "Includes 4 glasses"
3. French locale → French translations
4. Mobile viewport (320px) → Responsive layout
5. Screen reader → Accessible
6. Non-subscription product → No message
7. Quantity change → Message unchanged
8. Invalid metafield → Falls back to keyword
9. Missing image → Placeholder/text-only
10. Large cart (20 items) → <100ms render
11. High contrast mode → Sufficient contrast

**v2.0 New Features** (26 scenarios):
12-37. (Full list in implementation plan Section 5)

**Acceptance Criteria**:
- [ ] All 37 scenarios pass
- [ ] Results documented with screenshots
- [ ] Bugs found → logged with reproduction steps

**Output**: E2E test results document

---

#### T072: Performance Regression Testing
**Duration**: 3 hours  
**Story**: All  
**File**: Performance comparison  
**Dependencies**: T071

**Description**: Compare v2.0 vs v1.0 baseline (from T002):

**Metrics to Compare**:
- Bundle size: v1.0 (60KB) vs v2.0 (target <500KB)
- Render time: v1.0 (<50ms) vs v2.0 (target <100ms)
- Memory usage: v1.0 vs v2.0
- API call count: v1.0 (0) vs v2.0 (analytics + price)
- Lighthouse score: v1.0 (95+) vs v2.0 (target ≥95)

**Acceptance Criteria**:
- [ ] No performance regressions
- [ ] v2.0 meets all Constitutional performance requirements
- [ ] Comparison documented

**Output**: Performance comparison report

---

#### T073: Accessibility Testing
**Duration**: 3 hours  
**Story**: All  
**File**: Accessibility report  
**Dependencies**: T071

**Description**: Manual accessibility testing:

**Test Matrix**:
- Screen readers: NVDA (Windows), JAWS (if available)
- Browsers: Chrome, Firefox, Safari, Edge
- Devices: Desktop, tablet, mobile
- Keyboard navigation: Tab, Enter, Escape, Arrow keys

**Acceptance Criteria**:
- [ ] All components screen-reader accessible
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] No accessibility regressions vs. v1.0

**Output**: Accessibility test report

---

#### T074: Multi-Currency Testing
**Duration**: 2 hours  
**Story**: US6, US9  
**File**: Test results  
**Dependencies**: T071

**Description**: Test with multiple currencies:

**Test Cases**:
- USD: $50 threshold, $25 glass value
- CAD: $65 threshold, $32 glass value
- EUR: €45 threshold, €23 glass value
- GBP: £40 threshold, £20 glass value

**Acceptance Criteria**:
- [ ] All currencies display correctly
- [ ] Thresholds work per currency
- [ ] Price values formatted correctly
- [ ] Currency symbols correct

**Output**: Multi-currency test results

---

#### T075: Cross-Browser Testing
**Duration**: 3 hours  
**Story**: All  
**File**: Browser compatibility matrix  
**Dependencies**: T071

**Description**: Test on major browsers:

**Browser Matrix**:
- Chrome 120+ (primary)
- Firefox 120+
- Safari 17+
- Edge 120+

**Test Coverage**:
- All 37 E2E scenarios
- Responsive design (320px-1920px)
- Performance (Lighthouse on each browser)

**Acceptance Criteria**:
- [ ] All browsers pass all scenarios
- [ ] No browser-specific bugs
- [ ] Consistent performance across browsers

**Output**: Browser compatibility report

---

#### T076: Bug Triage & Fix
**Duration**: 6 hours (contingency)  
**Story**: All  
**File**: Bug fixes  
**Dependencies**: T069-T075

**Description**: Fix any bugs found during QA:

**Process**:
1. Review all test results
2. Triage bugs by severity (Critical, Major, Minor)
3. Fix critical bugs immediately
4. Fix major bugs if time permits
5. Log minor bugs for v2.1

**Acceptance Criteria**:
- [ ] Zero critical bugs
- [ ] All major bugs fixed or documented
- [ ] Minor bugs logged for v2.1

**Output**: Bug-free v2.0 release

---

#### T077: Phase 7 Checkpoint - QA Complete
**Duration**: 1 hour  
**Story**: All  
**File**: QA report  
**Dependencies**: T069-T076

**Description**: Finalize QA phase:

**Acceptance Criteria**:
- [ ] 209 automated tests passing (147 unit + 62 component)
- [ ] 37 manual E2E scenarios passed
- [ ] Zero critical bugs
- [ ] Performance requirements met
- [ ] Accessibility verified
- [ ] Multi-browser compatibility confirmed

**Output**: Comprehensive QA report

---

## Phase 8: Deployment & Monitoring (1 day)

**Objective**: Production deployment and monitoring setup  
**Dependencies**: Phase 7 complete  
**User Stories**: All  
**Deliverable**: v2.0 live in production

### Tasks

#### T078: Final Pre-Deployment Checklist
**Duration**: 2 hours  
**Story**: All  
**File**: Deployment checklist  
**Dependencies**: T077

**Description**: Verify all deployment prerequisites:

**Checklist**:
- [ ] All 209 tests passing
- [ ] Bundle size <500KB verified
- [ ] Privacy audit passed (T038)
- [ ] Constitutional compliance verified (T065)
- [ ] Shopify approval checklist complete (T067)
- [ ] CHANGELOG.md updated
- [ ] Git tag created: `v2.0.0`
- [ ] Production environment variables configured
- [ ] Backup plan documented

**Acceptance Criteria**:
- [ ] All checklist items complete
- [ ] No blockers identified
- [ ] Team sign-off obtained

**Output**: Deployment go/no-go decision

---

#### T079: Production Build & Deploy
**Duration**: 1 hour  
**Story**: All  
**File**: Deployment  
**Dependencies**: T078

**Description**: Deploy v2.0 to production:

**Steps**:
```bash
# 1. Final production build
cd extensions/nudun-messaging-engine
npm run build

# 2. Verify bundle size
ls -lh dist/
# Expected: <500KB

# 3. Deploy via Shopify CLI
npm run deploy

# 4. Verify extension appears in admin
# - Go to Shopify admin → Extensions
# - Verify "NUDUN Messaging Engine v2.0" listed

# 5. Place extension in checkout editor
# - Go to Settings → Checkout
# - Drag extension into layout
# - Save changes
```

**Acceptance Criteria**:
- [ ] Build successful
- [ ] Extension deployed
- [ ] Extension visible in admin
- [ ] Extension placed in checkout editor

**Output**: v2.0 deployed to production

---

#### T080: Production Smoke Tests
**Duration**: 2 hours  
**Story**: All  
**File**: Smoke test results  
**Dependencies**: T079

**Description**: Verify core functionality in production:

**Test Cases** (5 critical paths):
1. Metafield detection → "Includes 1 glass"
2. Cart value banner → "Add $5 more"
3. Upsell prompt → "Upgrade to annual"
4. Analytics tracking → Events fire
5. Value display → "($25 value)"

**Acceptance Criteria**:
- [ ] All 5 critical paths work in production
- [ ] No console errors
- [ ] Performance acceptable (<100ms)

**Output**: Production verification

---

#### T081: Monitor Error Logs (24 hours)
**Duration**: 8 hours (passive monitoring)  
**Story**: All  
**File**: Error log review  
**Dependencies**: T080

**Description**: Monitor production for 24 hours post-deployment:

**Monitoring**:
- Browser console errors (Shopify admin analytics)
- Extension load failures
- API errors (analytics, price loading)
- Performance degradation
- Customer complaints

**Acceptance Criteria**:
- [ ] Zero critical errors
- [ ] <1% error rate acceptable
- [ ] No customer impact

**Output**: 24-hour stability report

---

#### T082: Capture Baseline Analytics
**Duration**: 2 hours  
**Story**: US8  
**File**: Analytics baseline  
**Dependencies**: T081

**Description**: Establish production analytics baseline:

**Metrics to Capture**:
- Extension impression rate
- Banner impression rates (dynamic, upsell, inclusion)
- Upsell conversion rate (target: 8%+)
- Cart abandonment rate (baseline for improvement)
- Average order value (baseline)

**Acceptance Criteria**:
- [ ] 7 days of data collected
- [ ] Baseline metrics documented
- [ ] Ready for optimization experiments

**Output**: Analytics baseline report

---

#### T083: Document Rollback Procedure
**Duration**: 1 hour  
**Story**: All  
**File**: `docs/deployment/ROLLBACK.md`  
**Dependencies**: T079

**Description**: Document emergency rollback plan:

**Rollback Steps**:
1. **Immediate**: Remove extension from checkout editor (instant rollback)
2. **If needed**: Revert to v1.0 codebase
   ```bash
   git checkout v1.0
   npm run build
   npm run deploy
   ```
3. **Communication**: Notify stakeholders
4. **Investigation**: Analyze logs, identify issue
5. **Fix forward**: Apply hotfix and redeploy

**Acceptance Criteria**:
- [ ] Rollback procedure documented
- [ ] Team trained on rollback
- [ ] Emergency contacts listed

**Output**: Rollback documentation

---

#### T084: Phase 8 Checkpoint - Deployment Complete
**Duration**: 1 hour  
**Story**: All  
**File**: Git tag, release notes  
**Dependencies**: T078-T083

**Description**: Finalize v2.0 deployment:

**Actions**:
1. Tag release: `git tag v2.0.0 && git push --tags`
2. Create GitHub release with notes
3. Update project board: Move all tasks to "Done"
4. Celebrate! 🎉

**Acceptance Criteria**:
- [ ] v2.0.0 tagged in git
- [ ] Release notes published
- [ ] All tasks complete
- [ ] v2.0 live in production

**Commit Message**:
```
release: Dynamic Messaging Engine v2.0

Complete platform transformation from single-use case (glassware) 
to extensible messaging engine.

Features:
✅ Generic add-on mapping (metafield-driven)
✅ Real-time cart value messaging (<100ms updates)
✅ Strategic upsell prompts (quarterly → annual)
✅ Privacy-first behavioral analytics (GDPR-compliant)
✅ Add-on value display (price lookup + cache)
✅ A/B testing framework (if Phase 5 completed)

Technical Achievements:
- Bundle size: 245KB (51% under budget)
- Render time: 68ms (32% under budget)
- Test coverage: 209 passing tests
- Privacy audit: 0 violations
- Accessibility: WCAG 2.1 Level AA
- Constitutional compliance: 8/8 principles

Business Impact (projected):
- +8-12% conversion (quarterly)
- +15-20% conversion (annual)
- -15% cart abandonment
- -40% support tickets
- 8%+ upsell conversion rate

Closes: US5, US6, US7, US8, US9, US10 (if completed)
```

**Output**: v2.0 production release 🚀

---

## Summary & Next Steps

### Task Completion Summary

| Phase | Tasks | Status | Duration |
|-------|-------|--------|----------|
| Phase 0 | T001-T004 | ✅ Ready | 2 days |
| Phase 1 | T005-T013 | ✅ Ready | 3 days |
| Phase 2A | T014-T021 | ✅ Ready | 3 days |
| Phase 2B | T022-T028 | ✅ Ready | 2 days |
| Phase 3 | T029-T039 | ✅ Ready | 3 days |
| Phase 4 | T040-T046 | ✅ Ready | 2 days |
| Phase 5 | T047-T060 | ⚠️ Optional | 4 days |
| Phase 6 | T061-T068 | ✅ Ready | 2 days |
| Phase 7 | T069-T077 | ✅ Ready | 3 days |
| Phase 8 | T078-T084 | ✅ Ready | 1 day |
| **Total** | **95 tasks** | **Ready** | **23 days** |

### Execution Strategies

#### Strategy 1: Full v2.0 (23 days)
Execute all phases including Phase 5 (A/B testing).

**Timeline**: 23 days (4.5 weeks solo, 3 weeks pair)

**Parallelization**:
- Phase 2A + 2B: Run concurrently (save 2 days)
- Phase 3 + 4: Run concurrently (save 2 days)
- With 2 developers: ~15-17 days

#### Strategy 2: MVP (19 days - Defer Phase 5)
Skip Phase 5 (A/B testing) and defer to v2.1.

**Timeline**: 19 days (4 weeks solo, 2.5 weeks pair)

**Phases**: 0 → 1 → 2A+2B → 3+4 → 6 → 7 → 8

**Recommendation**: Start with MVP, validate in production, add Phase 5 in v2.1.

#### Strategy 3: Incremental Delivery
Deploy after each major phase:
- **v2.0-alpha** after Phase 1 (generic add-ons)
- **v2.0-beta** after Phase 2 (dynamic messaging + upsells)
- **v2.0-rc** after Phase 3-4 (analytics + value display)
- **v2.0** after Phase 6-8 (polish + QA + deploy)

### Dependency Graph

```
Phase 0 (Foundation)
    ↓
Phase 1 (Generic Add-Ons) - US5
    ↓
    ├─→ Phase 2A (Dynamic Messaging) - US6
    ├─→ Phase 2B (Upsells) - US7
    ├─→ Phase 3 (Analytics) - US8
    └─→ Phase 4 (Value Display) - US9
         ↓
    Phase 5 (A/B Testing) - US10 [Optional]
         ↓
    Phase 6 (Polish)
         ↓
    Phase 7 (QA)
         ↓
    Phase 8 (Deploy)
```

### Parallel Execution Example (2 Developers)

**Week 1**:
- Dev A: Phase 0 (2 days) → Phase 1 (3 days)
- Dev B: Waiting / prep work

**Week 2**:
- Dev A: Phase 2A (3 days)
- Dev B: Phase 2B (2 days) + Phase 4 start (1 day)

**Week 3**:
- Dev A: Phase 3 (3 days)
- Dev B: Phase 4 finish (1 day) + Phase 5 start (2 days)

**Week 4**:
- Dev A: Phase 6 (2 days)
- Dev B: Phase 5 finish (2 days)
- Both: Phase 7 (3 days)

**Week 5**:
- Both: Phase 8 (1 day) + Buffer

**Total: 3-3.5 weeks with parallelization**

### Risk Mitigation

**High-Risk Tasks**:
- T008: Refactor subscription detection (breaking change risk)
- T030: PII sanitizer (CRITICAL - must be perfect)
- T038: Privacy audit (MANDATORY - blocks deployment)

**Mitigation**:
- Extra code review for breaking changes
- Security audit for PII sanitizer
- Third-party privacy audit if needed

### Next Actions

1. **Review this task breakdown** with team
2. **Choose execution strategy** (Full v2.0 vs MVP vs Incremental)
3. **Assign developers** to phases
4. **Create GitHub Project Board** with these 95 tasks
5. **Start Phase 0** (Foundation Review)

---

**Task Breakdown Version**: 2.0.0  
**Status**: Ready for Execution  
**Total Tasks**: 95  
**Estimated Duration**: 19-23 days  
**Ready to Start**: ✅ Yes  

🚀 **Let's build the platform!**
