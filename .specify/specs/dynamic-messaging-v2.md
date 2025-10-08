# Feature Specification: Dynamic Messaging Engine v2.0

**Feature Branch**: `feature/dynamic-messaging-v2`  
**Created**: 2025-10-07  
**Status**: Draft - Enhanced Specification  
**Supersedes**: v1.0 (Included Glassware Messaging)  
**Target Release**: Phase 2 - Comprehensive Dynamic Messaging Platform  
**Constitutional Compliance**: ✅ Verified against v1.0.0

---

## Executive Summary

**What This Is**: Dynamic Messaging Engine v2.0 transforms the basic "included glassware" messaging (v1.0) into a comprehensive, extensible platform for real-time subscription intelligence, cart-triggered messaging, and behavioral analytics.

**Why This Matters**: 
- v1.0 solved ONE use case (glassware inclusion) with hardcoded logic
- v2.0 creates a PLATFORM that supports unlimited messaging scenarios
- Merchants can leverage subscription intelligence, cart value thresholds, upsell prompts, and analytics without code changes

**Key Evolution from v1.0**:

| Capability | v1.0 (Glassware) | v2.0 (Platform) |
|------------|------------------|-----------------|
| **Scope** | Hardcoded glass detection | Generic add-on mapping system |
| **Configuration** | Code-level only | Metafield-driven + fallback keywords |
| **Messaging Types** | Static inclusion text | Dynamic cart-value banners, upsells, alerts |
| **Analytics** | None | Behavioral event tracking + A/B testing hooks |
| **Value Display** | Basic count | Product price lookup + calculated totals |
| **Extensibility** | Single use case | Pattern for unlimited messaging scenarios |

**Business Impact Targets**:
- **Conversion Lift**: +8-12% (quarterly), +15-20% (annual) vs. baseline
- **Support Reduction**: -40% tickets related to "what's included?"
- **Cart Abandonment**: -15% via real-time value messaging
- **Average Order Value**: +10-15% via strategic upsell prompts

---

## Architecture Philosophy: v1.0 → v2.0 Evolution

### v1.0 Architecture (Foundation)
```
Detection Utility (subscriptionDetection.js)
    ↓
Message Component (GlasswareMessage.jsx)
    ↓
Orchestration (Checkout.jsx)
```

**Strengths**: Simple, focused, working foundation  
**Limitations**: Hardcoded for glassware, not extensible

### v2.0 Architecture (Platform)
```
Configuration Layer (Metafields + Rules Engine)
    ↓
Detection Layer (Multiple Detectors: subscription, cart value, product type)
    ↓
Messaging Layer (Multiple Components: inclusion, banner, upsell)
    ↓
Analytics Layer (Event tracking + A/B testing)
    ↓
Orchestration (Smart Router based on context)
```

**Benefits**: 
- ✅ Add new messaging scenarios without code changes (configuration-driven)
- ✅ Multiple detectors run in parallel (subscription + cart + product)
- ✅ Analytics hooks track every interaction for optimization
- ✅ A/B testing built-in for message optimization

---

## User Scenarios & Testing *(mandatory)*

<!--
  User stories PRIORITIZED as independently testable journeys.
  Builds on v1.0 foundation (US1-US4 already defined).
  New v2.0 stories focus on PLATFORM capabilities.
-->

### 🆕 User Story 5 - Generic Add-On Mapping (Priority: P1)

**Scenario**: Merchant sells multiple subscription products with different included add-ons (glasses, bottles, accessories). System automatically detects subscription type via metafield `subscription_type` and displays appropriate add-on messaging without hardcoding.

**Why this priority**: v1.0's hardcoded "glassware" logic doesn't scale. This is the core platform capability that enables unlimited messaging scenarios.

**Independent Test**: Configure metafield `subscription_type: "quarterly_with_glass"` → verify "Includes 1 glass" appears. Change to `subscription_type: "quarterly_with_bottle"` → verify "Includes 1 bottle" appears.

**Acceptance Scenarios**:

1. **Given** product has metafield `subscription_type: "quarterly_with_glass"`, **When** added to cart, **Then** displays "Includes **1** premium glass ($25 value)"
2. **Given** product has metafield `subscription_type: "annual_with_accessories"`, **When** added to cart, **Then** displays "Includes **4** accessory sets ($120 value)"
3. **Given** product has NO metafield but title contains "quarterly", **When** added to cart, **Then** falls back to keyword detection and shows default "Includes **1** premium glass"
4. **Given** product has metafield `subscription_type: "custom_3month_2glasses"`, **When** added to cart, **Then** displays "Includes **2** premium glasses ($50 value)"
5. **Given** merchant updates metafield from "quarterly_with_glass" to "quarterly_with_bottle", **When** customer refreshes cart, **Then** messaging updates to bottle without code deployment

**Technical Requirements**:
- **TR-005.1**: System MUST read metafield `custom.subscription_type` (namespace: custom, key: subscription_type)
- **TR-005.2**: System MUST parse metafield format: `{interval}_{count}_{addonType}` (e.g., "quarterly_1_glass")
- **TR-005.3**: System MUST support fallback to v1.0 keyword detection if metafield missing
- **TR-005.4**: System MUST cache metafield data per session (avoid repeated API calls)
- **TR-005.5**: System MUST support multiple add-on types: glass, bottle, accessory, sticker, sample

---

### 🆕 User Story 6 - Real-Time Cart Value Messaging (Priority: P1)

**Scenario**: Customer has $45 in cart. System displays banner: "Add $5 more for free shipping!" Updates live as customer adds/removes items. When cart reaches $50, banner changes to: "🎉 You've unlocked free shipping!"

**Why this priority**: Cart abandonment #1 driver is "unexpected shipping costs." Real-time value messaging increases conversion by showing clear path to free shipping threshold.

**Independent Test**: Add $45 of products → verify "Add $5 more" banner. Add $10 item → verify banner changes to "You've unlocked free shipping!"

**Acceptance Scenarios**:

1. **Given** cart total is $45, **When** checkout page loads, **Then** displays banner: "Add $5.00 more for free shipping!" (tone: info)
2. **Given** cart total is $50+, **When** checkout page loads, **Then** displays banner: "🎉 You've unlocked free shipping!" (tone: success)
3. **Given** cart total is $45, **When** customer adds $10 item, **Then** banner dynamically updates to success message WITHOUT page reload (<100ms)
4. **Given** cart total is $55, **When** customer removes $10 item, **Then** banner dynamically updates back to "Add $5 more" message
5. **Given** customer's locale is French, **When** viewing cart value banner, **Then** displays "Ajoutez $5.00 de plus pour la livraison gratuite!"
6. **Given** cart has free shipping qualification, **When** customer proceeds to checkout, **Then** shipping method shows $0.00 shipping option

**Technical Requirements**:
- **TR-006.1**: System MUST monitor `shopify.cost.subtotalAmount.value` reactively
- **TR-006.2**: System MUST calculate difference to threshold: `threshold - current`
- **TR-006.3**: System MUST use `shopify.i18n.formatCurrency()` for amounts
- **TR-006.4**: System MUST support configurable threshold (default: $50 USD)
- **TR-006.5**: System MUST handle multi-currency scenarios (threshold per currency)
- **TR-006.6**: Banner MUST update within <100ms of cart change (Constitutional requirement)

---

### 🆕 User Story 7 - Strategic Upsell Prompts (Priority: P2)

**Scenario**: Customer has quarterly subscription in cart. System detects opportunity and displays: "Upgrade to annual and save $20 + get 4 glasses instead of 1!" with inline upgrade button.

**Why this priority**: Upselling quarterly → annual increases LTV by 4× and reduces churn. Strategic prompts at decision point drive 10-15% upgrade rate.

**Independent Test**: Add quarterly subscription → verify upsell banner with "Upgrade to annual" prompt. Click upgrade → verify cart updates to annual variant.

**Acceptance Scenarios**:

1. **Given** cart contains quarterly subscription product, **When** viewing checkout, **Then** displays banner: "Upgrade to annual and save $20 + get 4 glasses instead of 1!"
2. **Given** upsell banner displayed, **When** customer clicks "Upgrade to Annual" button, **Then** cart replaces quarterly variant with annual variant
3. **Given** cart contains annual subscription, **When** viewing checkout, **Then** NO upsell banner displayed (already highest tier)
4. **Given** cart contains non-subscription products only, **When** viewing checkout, **Then** NO upsell banner displayed
5. **Given** customer has abandoned cart with quarterly subscription, **When** returning via email link, **Then** upsell banner displays prominently with "Don't miss out!" tone
6. **Given** cart contains quarterly + annual subscriptions, **When** viewing checkout, **Then** displays upsell for quarterly only (contextual intelligence)

**Technical Requirements**:
- **TR-007.1**: System MUST detect subscription tier hierarchy (quarterly < annual)
- **TR-007.2**: System MUST calculate savings: `(annual_price / 4) - quarterly_price`
- **TR-007.3**: System MUST provide inline upgrade action via `shopify.cart.updateLineItem()`
- **TR-007.4**: System MUST track upsell impressions and conversions via analytics
- **TR-007.5**: System MUST support configurable upsell messaging per product
- **TR-007.6**: System MUST hide upsell after upgrade action completes (avoid duplicate prompts)

---

### 🆕 User Story 8 - Behavioral Analytics Tracking (Priority: P2)

**Scenario**: Data analyst wants to understand customer behavior at checkout. System tracks field focus events (email, address), discount code attempts, cart modifications, and shipping selections. Data streams to analytics platform for A/B testing and funnel optimization.

**Why this priority**: Micro-interactions reveal conversion blockers. Analytics enable data-driven optimization and A/B testing of messaging strategies.

**Independent Test**: Focus email field → verify analytics event fires. Apply discount code → verify event with code value. Check analytics dashboard → verify events appear.

**Acceptance Scenarios**:

1. **Given** customer focuses email field, **When** field receives focus, **Then** fires event: `checkout.field.focus` with `{ field: "email", timestamp: ... }`
2. **Given** customer enters address, **When** country field changes, **Then** fires event: `checkout.address.change` with `{ field: "country", value: "CA" }`
3. **Given** customer applies discount code, **When** code is applied, **Then** fires event: `checkout.discount.applied` with `{ code: "SAVE10", success: true }`
4. **Given** customer adds item to cart, **When** cart updates, **Then** fires event: `cart.item.added` with `{ productId, quantity, totalValue }`
5. **Given** customer selects shipping method, **When** option selected, **Then** fires event: `checkout.shipping.selected` with `{ method: "Standard", cost: "$5.99" }`
6. **Given** checkout extension loaded, **When** initial render completes, **Then** fires event: `extension.loaded` with `{ extensionName, loadTime }`

**Privacy & Compliance**:
- ⚠️ **CRITICAL**: NO personally identifiable information (PII) in events without consent
- ✅ Email, address, payment info NEVER logged
- ✅ Product IDs, cart totals, interaction types ONLY
- ✅ GDPR-compliant: Events deleted after 90 days
- ✅ Merchant must enable analytics explicitly (opt-in)

**Technical Requirements**:
- **TR-008.1**: System MUST use `shopify.analytics.publish()` for all events
- **TR-008.2**: System MUST sanitize all event data (no PII)
- **TR-008.3**: System MUST implement event batching (max 1 event per 100ms per type)
- **TR-008.4**: System MUST support custom event properties (extensible schema)
- **TR-008.5**: System MUST fail gracefully if analytics API unavailable (no errors)
- **TR-008.6**: System MUST respect Do Not Track browser setting

---

### 🆕 User Story 9 - Add-On Value Display Enhancement (Priority: P1)

**Scenario**: Customer sees "Includes 1 premium glass" but doesn't understand the value. Enhanced system fetches glass product price from Shopify store and displays: "Includes **1** premium glass ($25 value)" to emphasize benefit and prevent duplicate purchases.

**Why this priority**: Explicit value display increases perceived subscription value by 15-20% and reduces "I'll just buy the glass separately" decisions.

**Independent Test**: Add quarterly subscription → verify message shows "($25 value)". Check Shopify product "premium-glass" → verify price matches display.

**Acceptance Scenarios**:

1. **Given** Shopify store has product with handle "premium-glass" priced at $25, **When** quarterly subscription added to cart, **Then** displays "Includes **1** premium glass ($25.00 value)"
2. **Given** annual subscription in cart, **When** viewing checkout, **Then** displays "Includes **4** premium glasses ($100.00 value)" (calculated: 4 × $25)
3. **Given** product "premium-glass" not found in store, **When** subscription added, **Then** displays "Includes **1** premium glass" (graceful fallback, no price)
4. **Given** product "premium-glass" price changes from $25 to $30, **When** customer refreshes cart, **Then** displays updated "$30.00 value" (real-time price sync)
5. **Given** customer's locale is French, **When** viewing value message, **Then** displays "Comprend **1** verre premium (valeur de $25,00)"
6. **Given** cart has multiple add-on types (glass + bottle), **When** viewing checkout, **Then** displays separate value for each: "Includes 1 glass ($25 value) and 1 bottle ($15 value)"

**Technical Requirements**:
- **TR-009.1**: System MUST query Shopify Storefront API for product by handle
- **TR-009.2**: System MUST extract price from `product.variants.edges[0].node.price`
- **TR-009.3**: System MUST cache price per session (avoid repeated queries)
- **TR-009.4**: System MUST handle product not found gracefully (fallback to no-value message)
- **TR-009.5**: System MUST support configurable product handles per add-on type
- **TR-009.6**: System MUST calculate total value for multi-item add-ons (annual: 4 × price)

---

### 🆕 User Story 10 - A/B Testing Framework (Priority: P3)

**Scenario**: Marketing team wants to test two upsell messages: "Upgrade to annual" vs. "Save $20 with annual". System randomly assigns customers to variant A or B, tracks conversion rates, and reports winner.

**Why this priority**: Data-driven optimization increases conversion rates by 5-10% over intuition-based messaging. Required for mature marketing optimization.

**Independent Test**: Configure A/B test with 2 variants → verify 50% see variant A, 50% see variant B. Track conversions → verify analytics capture variant attribution.

**Acceptance Scenarios**:

1. **Given** A/B test configured for upsell message, **When** customer loads checkout, **Then** randomly assigned to variant A or B with 50/50 split
2. **Given** customer in variant A, **When** viewing upsell, **Then** displays "Upgrade to annual and save $20"
3. **Given** customer in variant B, **When** viewing upsell, **Then** displays "Get 4 glasses with annual plan"
4. **Given** customer in variant A clicks upgrade, **When** conversion occurs, **Then** analytics event includes `{ variant: "A", converted: true }`
5. **Given** A/B test runs for 1000 sessions, **When** analyzing results, **Then** dashboard shows conversion rate per variant with statistical significance
6. **Given** variant A wins with 95% confidence, **When** merchant views dashboard, **Then** system recommends making variant A permanent

**Technical Requirements**:
- **TR-010.1**: System MUST implement deterministic variant assignment (consistent per session)
- **TR-010.2**: System MUST support configurable split ratios (50/50, 70/30, etc.)
- **TR-010.3**: System MUST track impressions and conversions per variant
- **TR-010.4**: System MUST calculate statistical significance (chi-square test)
- **TR-010.5**: System MUST support multiple concurrent A/B tests (non-interfering)
- **TR-010.6**: System MUST provide merchant dashboard for test configuration and results

---

### Edge Cases (Expanded from v1.0)

**v1.0 Edge Cases (Still Valid)**:
- ✅ Subscription title doesn't contain keywords → No message displayed
- ✅ Glass image URL returns 404 → Placeholder icon or text-only
- ✅ Customer has 10 subscriptions → Each shows independent messaging (<100ms)
- ✅ Shopify API doesn't return line items → Safe null handling, no errors
- ✅ Discount code applied → Messages remain visible
- ✅ Product title changes mid-session → Detection uses current title
- ✅ Checkout language differs from storefront → Use checkout locale

**v2.0 New Edge Cases**:

- **What happens when metafield format is invalid?** → Fall back to keyword detection, log warning for merchant
- **What happens when cart value banner threshold crossed multiple times rapidly?** → Debounce updates (max 1 per 100ms), show latest state
- **What happens when upsell variant doesn't exist?** → Hide upsell banner, log error, don't break UI
- **What happens when analytics API rate limited?** → Queue events locally, retry with exponential backoff
- **What happens when A/B test has 0 impressions?** → Dashboard shows "Insufficient data", no winner declared
- **What happens when customer has adblocker blocking analytics?** → Messages still display, analytics fail silently
- **What happens when two upsell banners qualify simultaneously?** → Show highest-value upsell only (priority queue)
- **What happens when product price API returns null?** → Display message without value, don't show "$0.00"
- **What happens when customer toggles between currencies?** → Recalculate thresholds and values in new currency
- **What happens when merchant disables analytics?** → All tracking stops, messages continue working

---

## Requirements *(mandatory)*

### Functional Requirements (Expanded from v1.0)

**Inherited from v1.0** (FR-001 to FR-017 still valid):
- ✅ Subscription detection via keywords
- ✅ Glass count calculation (quarterly=1, annual=4)
- ✅ Cart & checkout rendering
- ✅ Image display with fallback
- ✅ Localization support
- ✅ Accessibility compliance
- ✅ Performance <100ms
- ✅ Optional chaining for all Shopify data

**v2.0 New Requirements**:

#### Generic Add-On System
- **FR-018**: System MUST read product metafield `custom.subscription_type` with format: `{interval}_{count}_{addonType}`
- **FR-019**: System MUST support add-on types: glass, bottle, accessory, sticker, sample (extensible list)
- **FR-020**: System MUST maintain add-on configuration map: `{ addonType: { name, imageUrl, productHandle } }`
- **FR-021**: System MUST fall back to v1.0 keyword detection if metafield missing or invalid
- **FR-022**: System MUST support multiple add-ons per subscription (e.g., "1 glass + 1 sticker")

#### Real-Time Dynamic Messaging
- **FR-023**: System MUST monitor cart subtotal reactively via `shopify.cost.subtotalAmount.value`
- **FR-024**: System MUST support configurable value thresholds (default: $50 free shipping)
- **FR-025**: System MUST calculate remaining amount: `threshold - current`
- **FR-026**: System MUST display banner with tone: info (below threshold), success (met threshold)
- **FR-027**: System MUST update banner within <100ms of cart value change
- **FR-028**: System MUST support multiple simultaneous banners (priority queue, max 2 visible)

#### Strategic Upsells
- **FR-029**: System MUST detect upsell opportunities (quarterly → annual available)
- **FR-030**: System MUST calculate upsell savings and benefits
- **FR-031**: System MUST provide inline upgrade action via `shopify.cart.updateLineItem()`
- **FR-032**: System MUST track upsell impressions and conversions via analytics
- **FR-033**: System MUST hide upsell after successful upgrade (no duplicate prompts)

#### Behavioral Analytics
- **FR-034**: System MUST track events: field focus, address change, discount apply, cart modification, shipping selection
- **FR-035**: System MUST use `shopify.analytics.publish()` for all events
- **FR-036**: System MUST sanitize events (NO PII: email, address, payment)
- **FR-037**: System MUST implement event batching (max 1 per 100ms per type)
- **FR-038**: System MUST respect Do Not Track setting
- **FR-039**: System MUST fail gracefully if analytics unavailable (no errors thrown)

#### Value Display
- **FR-040**: System MUST query Shopify Storefront API for add-on product prices
- **FR-041**: System MUST cache prices per session (avoid repeated queries)
- **FR-042**: System MUST display format: "Includes **X** {addon} (${price} value)"
- **FR-043**: System MUST calculate total value for multi-item add-ons (annual: 4 × price)
- **FR-044**: System MUST fall back to no-value message if product not found
- **FR-045**: System MUST update displayed value if product price changes mid-session

#### A/B Testing
- **FR-046**: System MUST implement deterministic variant assignment (consistent per session)
- **FR-047**: System MUST support configurable split ratios (50/50, 70/30, etc.)
- **FR-048**: System MUST track impressions and conversions per variant
- **FR-049**: System MUST calculate statistical significance (chi-square test)
- **FR-050**: System MUST support multiple concurrent A/B tests without interference

*Clarifications needed:*

- **FR-051**: System MUST handle merchant-configurable thresholds [NEEDS CLARIFICATION: Admin UI for threshold management? Or hardcoded config file?]
- **FR-052**: System MUST integrate with external analytics platforms [NEEDS CLARIFICATION: GA4, Segment, Mixpanel? Which integrations required?]
- **FR-053**: System MUST support subscription interval beyond quarterly/annual [NEEDS CLARIFICATION: Monthly, biannual, custom intervals?]

### Key Entities (Expanded from v1.0)

**v1.0 Entities** (Still Valid):
- ✅ Subscription Line Item
- ✅ Glassware Message Component
- ✅ Localization Key

**v2.0 New Entities**:

#### Add-On Configuration
- **Attributes**: `type` (string), `name` (string), `imageUrl` (string), `productHandle` (string), `defaultCount` (number)
- **Examples**: 
  - `{ type: "glass", name: "Premium Glass", imageUrl: "...", productHandle: "premium-glass", defaultCount: 1 }`
  - `{ type: "bottle", name: "Stainless Bottle", imageUrl: "...", productHandle: "steel-bottle", defaultCount: 1 }`
- **Source**: Configuration file (v2.0 MVP) → Admin metafields (v2.1 future)

#### Cart Value Threshold
- **Attributes**: `threshold` (Money), `message` (i18n key), `tone` (info|success), `priority` (number)
- **Examples**:
  - `{ threshold: { amount: "50.00", currencyCode: "USD" }, message: "banner.freeShipping", tone: "info", priority: 1 }`
  - `{ threshold: { amount: "100.00", currencyCode: "USD" }, message: "banner.giftIncluded", tone: "success", priority: 2 }`

#### Upsell Opportunity
- **Attributes**: `fromVariantId` (string), `toVariantId` (string), `savings` (Money), `message` (i18n key), `benefits` (string[])
- **Example**: `{ fromVariantId: "123", toVariantId: "456", savings: { amount: "20.00", currencyCode: "USD" }, message: "upsell.annualSavings", benefits: ["4 glasses instead of 1", "Free shipping", "$20 total savings"] }`

#### Analytics Event
- **Attributes**: `type` (string), `properties` (object), `timestamp` (number), `sessionId` (string), `variantId` (string, optional)
- **Examples**:
  - `{ type: "checkout.field.focus", properties: { field: "email" }, timestamp: 1728329472000 }`
  - `{ type: "upsell.converted", properties: { fromVariant: "quarterly", toVariant: "annual", savings: 20 }, timestamp: ..., variantId: "A" }`

#### A/B Test Configuration
- **Attributes**: `testId` (string), `variants` (object[]), `splitRatio` (number[]), `startDate` (date), `endDate` (date), `status` (active|paused|completed)
- **Example**: `{ testId: "upsell-message-test", variants: [{ id: "A", message: "Upgrade to annual" }, { id: "B", message: "Save $20 with annual" }], splitRatio: [0.5, 0.5], startDate: "2025-10-08", status: "active" }`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes (Expanded from v1.0)

**v1.0 Criteria** (SC-001 to SC-010 still valid):
- ✅ Quarterly/annual glass messaging displays <100ms
- ✅ Screen reader accessibility verified
- ✅ Mobile responsiveness 320px+
- ✅ Graceful error handling
- ✅ Localization accuracy
- ✅ Bundle size <50KB

**v2.0 New Criteria**:

#### Generic Add-On System
- **SC-011**: Merchants can configure new add-on types without code deployment (verified with 3 test add-ons: glass, bottle, accessory)
- **SC-012**: Metafield-based detection accuracy ≥99% (tested with 100 test products)
- **SC-013**: Fallback to keyword detection works when metafield missing (verified with 20 test cases)

#### Real-Time Dynamic Messaging
- **SC-014**: Cart value banner updates within <100ms of cart change (verified with performance profiling)
- **SC-015**: Banner displays correctly for 10 currency codes (USD, CAD, EUR, GBP, AUD, etc.)
- **SC-016**: Multiple banners display in priority order without overlap (tested with 3 simultaneous triggers)

#### Strategic Upsells
- **SC-017**: Upsell conversion rate ≥8% (quarterly → annual upgrades)
- **SC-018**: Upsell banner impression tracking 100% accurate (verified with analytics audit)
- **SC-019**: Inline upgrade action succeeds ≥99% (tested with 100 upgrade attempts)

#### Behavioral Analytics
- **SC-020**: Analytics events fire 100% reliably when tracking enabled (verified with event monitoring)
- **SC-021**: Zero PII leakage in events (verified with GDPR audit)
- **SC-022**: Event batching reduces API calls by ≥80% (verified with network profiling)
- **SC-023**: Do Not Track compliance 100% (verified with DNT browser setting tests)

#### Value Display
- **SC-024**: Product price lookup success rate ≥98% (verified with 100 test queries)
- **SC-025**: Price display accuracy 100% (verified with manual price verification)
- **SC-026**: Price cache reduces API calls by ≥90% (verified with session replay)

#### A/B Testing
- **SC-027**: Variant assignment consistency 100% per session (verified with 1000 test sessions)
- **SC-028**: Statistical significance calculation accuracy ≥99% (verified with test data)
- **SC-029**: Concurrent A/B tests don't interfere (verified with 3 simultaneous tests)

### Business Impact (Enhanced from v1.0)

**v1.0 Targets** (Still Valid):
- ✅ +5% quarterly conversion lift
- ✅ +10% annual conversion lift
- ✅ -30% support tickets

**v2.0 Enhanced Targets**:
- **Conversion Lift**: +8-12% (quarterly), +15-20% (annual) via value messaging + upsells
- **Cart Abandonment**: -15% via real-time value messaging and threshold prompts
- **Average Order Value**: +10-15% via strategic upsell prompts
- **Support Reduction**: -40% tickets related to subscriptions, add-ons, and cart questions
- **Customer Satisfaction**: +1.0 NPS points via improved transparency
- **Data-Driven Optimization**: 5-10% ongoing conversion improvement via A/B testing

---

## Technical Context *(informative)*

### Architectural Patterns

#### Pattern 1: Configuration-Driven Detection
```javascript
// v1.0: Hardcoded
if (title.includes('quarterly')) return 1;

// v2.0: Configuration-driven
const config = getAddOnConfig(metafield || parseKeywords(title));
return config.count;
```

**Benefits**: 
- ✅ Add new add-on types without code changes
- ✅ Merchant-configurable via metafields
- ✅ Extensible to unlimited messaging scenarios

#### Pattern 2: Reactive Banner System
```javascript
// v2.0: Reactive messaging
const cartTotal = shopify.cost.subtotalAmount.value;
const thresholds = getActiveThresholds();
const banner = thresholds.find(t => cartTotal.amount < t.threshold.amount);

// Auto-updates when cartTotal changes (Preact signals)
```

**Benefits**:
- ✅ Real-time updates without page reload
- ✅ Multiple banners via priority queue
- ✅ <100ms update performance

#### Pattern 3: Analytics Middleware
```javascript
// v2.0: Event tracking abstraction
analytics.track('checkout.field.focus', { field: 'email' });

// Internally:
// 1. Sanitize (remove PII)
// 2. Batch (debounce 100ms)
// 3. Publish via shopify.analytics.publish()
// 4. Fail silently if unavailable
```

**Benefits**:
- ✅ Privacy-compliant by design
- ✅ Reduced API calls (batching)
- ✅ Extensible event types

#### Pattern 4: Upsell Router
```javascript
// v2.0: Contextual upsell selection
const opportunities = detectUpsells(cart);
const highestValue = opportunities.sort((a, b) => b.savings - a.savings)[0];
return <UpsellBanner opportunity={highestValue} />;
```

**Benefits**:
- ✅ Prioritizes highest-value upsell
- ✅ Contextual to cart contents
- ✅ Single banner to avoid clutter

### Relevant Constitution Principles

**All v1.0 Principles Apply** (I-V), plus:

**Principle VI: Configuration Over Code** (New for v2.0)
- Prefer metafield-driven configuration over hardcoded logic
- Support merchant self-service via admin UI (future)
- Code should be generic; business rules should be data

**Principle VII: Privacy by Design**
- NEVER log PII without explicit consent
- Analytics events MUST be sanitized
- GDPR compliance is NON-NEGOTIABLE
- Fail gracefully if privacy tools block tracking

**Principle VIII: Performance Budget**
- Each new feature MUST stay within performance budget
- Total extension bundle: <500KB (v2.0 adds ~150KB)
- Render time: <100ms (unchanged from v1.0)
- API calls: Minimize via caching and batching

### Dependencies (Expanded from v1.0)

**v1.0 Dependencies** (Still Required):
- ✅ Preact
- ✅ @shopify/ui-extensions
- ✅ shopify.lines.value
- ✅ shopify.i18n.translate()
- ✅ shopify.localization.value

**v2.0 New Dependencies**:
- `shopify.metafield.value` (read product metafields)
- `shopify.cost.subtotalAmount.value` (cart total monitoring)
- `shopify.cart.updateLineItem()` (upsell upgrade action)
- `shopify.analytics.publish()` (event tracking)
- `shopify.query()` (Storefront API for price lookup)

**Build Dependencies**:
- Vitest (testing framework)
- @testing-library/preact (component testing)
- preact/signals (reactive state)

---

## Risks & Mitigations (Expanded from v1.0)

### Technical Risks (Inherited from v1.0)

**v1.0 Risks** (Still Valid):
- ✅ RISK-001: Image CDN failure → Fallback placeholder
- ✅ RISK-002: Keyword detection false positives → Add metafield support (now v2.0 feature)
- ✅ RISK-003: Performance with large carts → Optimization + profiling
- ✅ RISK-004: Localization key missing → Fallback to English

### v2.0 New Technical Risks

**RISK-007: Metafield Format Inconsistency (Medium)**
- **Impact**: Invalid metafield format breaks detection
- **Mitigation**: Schema validation, fallback to keyword detection, merchant documentation
- **Detection**: Unit tests verify format parsing; logs track invalid formats

**RISK-008: Analytics API Rate Limiting (Medium)**
- **Impact**: Events dropped during high traffic periods
- **Mitigation**: Local event queue with retry logic, exponential backoff, batch requests
- **Detection**: Monitor API response codes; alert on >5% event loss

**RISK-009: Upsell Variant Availability (Low)**
- **Impact**: Upgrade button shown but target variant out of stock
- **Mitigation**: Check variant availability via API before showing upsell; hide if unavailable
- **Detection**: Track upgrade failure rate; alert on >2% failures

**RISK-010: Price Lookup Performance (Medium)**
- **Impact**: Fetching prices adds latency, delays message display
- **Mitigation**: Aggressive caching (session-level), fallback to no-price message, async loading
- **Detection**: Performance profiling; monitor query time; alert on >200ms average

**RISK-011: A/B Test Configuration Conflicts (Low)**
- **Impact**: Overlapping tests show contradictory messages
- **Mitigation**: Test isolation logic, priority queues, merchant validation warnings
- **Detection**: Configuration validation; unit tests verify isolation

**RISK-012: Privacy Compliance Violation (High)**
- **Impact**: PII leakage in analytics → GDPR violations, Shopify rejection
- **Mitigation**: Strict event sanitization, automated PII detection, regular audits, opt-in analytics
- **Detection**: Automated tests verify no PII in events; quarterly GDPR audits

### Business Risks (Expanded from v1.0)

**RISK-013: Feature Complexity Overwhelms Merchants (Medium)**
- **Impact**: Merchants struggle to configure metafields, thresholds, A/B tests
- **Mitigation**: Comprehensive onboarding guide, video tutorials, sensible defaults, admin UI wizard
- **Detection**: Support ticket volume; merchant feedback surveys

**RISK-014: Over-Messaging Annoys Customers (Medium)**
- **Impact**: Too many banners/upsells reduce conversion instead of increasing
- **Mitigation**: Message priority queue (max 2 visible), frequency caps, A/B testing to validate
- **Detection**: Track cart abandonment rate; A/B test message frequency

---

## Open Questions (Expanded from v1.0)

### v1.0 Questions (Some Answered by v2.0)

1. ~~Should glass count be configurable per product?~~ → ✅ **ANSWERED**: Yes, via metafield `subscription_type`
2. ~~Should detection use sellingPlan metadata?~~ → ✅ **ANSWERED**: Metafield preferred, keyword fallback
3. ~~Should we fire analytics events?~~ → ✅ **ANSWERED**: Yes, comprehensive behavioral tracking
4. ~~Should image URL be merchant-configurable?~~ → ✅ **ANSWERED**: Yes, via add-on configuration map

### v2.0 New Questions

5. **Which external analytics platforms should we integrate?** (GA4, Segment, Mixpanel, Klaviyo?)  
   → Suggested resolution: Start with shopify.analytics.publish() (built-in); add GA4 integration in v2.1; Segment/Mixpanel via webhook in v2.2

6. **Should cart value thresholds be merchant-configurable via admin UI?**  
   → Suggested resolution: Hardcode $50 USD for MVP; add admin UI in v2.1 if merchants request flexibility

7. **Should A/B testing require manual winner selection or auto-promote?**  
   → Suggested resolution: Manual winner selection for v2.0 (safety); explore auto-promotion with confidence thresholds in v2.2

8. **Should upsells support cross-sell (add product) vs. upgrade (replace variant)?**  
   → Suggested resolution: Start with upgrade (simpler); add cross-sell in v2.1 if demand exists

9. **Should value display support bundles (multiple add-ons with combined price)?**  
   → Suggested resolution: Start with individual add-on pricing; add bundle logic in v2.1 if merchants use bundles

10. **Should analytics events support custom merchant-defined events?**  
    → Suggested resolution: Predefined event types for v2.0 (stability); add custom events API in v2.2

---

## Implementation Roadmap: v1.0 → v2.0 Migration

### Phase 0: Foundation Review (v1.0 Completion)
**Duration**: 2 days  
**Deliverables**:
- ✅ v1.0 fully implemented (35 tasks complete)
- ✅ Extension bundle <50KB verified
- ✅ Shopify approval checklist passed
- ✅ Manual testing complete (quarterly, annual, French, a11y)

### Phase 1: Architecture Refactor (v2.0 Foundation)
**Duration**: 3 days  
**Deliverables**:
- Refactor v1.0 hardcoded "glass" logic into generic add-on system
- Create configuration layer (add-on map)
- Implement metafield reading logic
- Maintain backward compatibility (keyword fallback)
- **Milestone**: Add new add-on type (bottle) without code changes

### Phase 2A: Real-Time Dynamic Messaging
**Duration**: 3 days  
**Deliverables**:
- Cart value threshold detection
- Banner component with tone states
- Reactive updates (<100ms)
- Multi-currency support
- Localization for threshold messages
- **Milestone**: "Add $X for free shipping" banner works across currencies

### Phase 2B: Strategic Upsells
**Duration**: 2 days  
**Deliverables**:
- Upsell opportunity detection
- Savings calculation
- Inline upgrade action
- Analytics tracking (impressions, conversions)
- Priority queue for multiple upsells
- **Milestone**: Quarterly → Annual upsell converts ≥8%

### Phase 3: Behavioral Analytics
**Duration**: 3 days  
**Deliverables**:
- Event tracking framework
- PII sanitization layer
- Event batching and retry logic
- shopify.analytics.publish() integration
- Do Not Track compliance
- Privacy documentation
- **Milestone**: 10 event types tracked reliably

### Phase 4: Value Display Enhancement
**Duration**: 2 days  
**Deliverables**:
- Storefront API price lookup
- Session-level price caching
- Total value calculation (multi-item)
- Graceful fallback (no-price mode)
- Real-time price sync
- **Milestone**: "($X value)" displays for all add-ons

### Phase 5: A/B Testing Framework
**Duration**: 4 days  
**Deliverables**:
- Variant assignment logic
- Split ratio configuration
- Impression and conversion tracking
- Statistical significance calculation
- Merchant dashboard (basic)
- Test isolation (concurrent tests)
- **Milestone**: Run 2 concurrent A/B tests without interference

### Phase 6: Polish & Optimization
**Duration**: 2 days  
**Deliverables**:
- Bundle size optimization (<500KB total)
- Performance profiling (<100ms render)
- Error handling audit
- Documentation updates
- Constitutional compliance verification
- **Milestone**: v2.0 passes Shopify approval checklist

### Phase 7: Testing & QA
**Duration**: 3 days  
**Deliverables**:
- Unit tests (100 detection, 90%+ components)
- Component tests (14 scenarios)
- Manual E2E tests (20 scenarios)
- Accessibility audit (NVDA/JAWS)
- Mobile testing (iOS/Android)
- Multi-currency testing (10 currencies)
- **Milestone**: Zero critical bugs, 95%+ approval score

### Phase 8: Deployment & Monitoring
**Duration**: 1 day  
**Deliverables**:
- Production deployment
- Analytics baseline capture
- Performance monitoring setup
- Error tracking dashboard
- Merchant onboarding guide
- **Milestone**: v2.0 live in production

**Total Duration**: ~23 days (~4.5 weeks)  
**Team Size**: 1-2 developers (solo: 4.5 weeks, pair: 3 weeks)

---

## Next Steps

After specification approval:

1. **Run `/speckit.plan`** to generate technical implementation plan with v2.0 architecture
2. **Review plan against SHOPIFY-APPROVAL-CHECKLIST.md** for compliance
3. **Run `/speckit.tasks`** to break down into actionable, reviewable tasks (~80-100 tasks estimated)
4. **Create feature branch**: `feature/dynamic-messaging-v2`
5. **Run `/speckit.implement`** to execute tasks following quality gates

---

## Reviewer Notes

**Critical Verification Points**:

### v1.0 Foundation
- [ ] **v1.0 Complete**: Verify all 35 v1.0 tasks are complete and approved before starting v2.0
- [ ] **Backward Compatibility**: Confirm v2.0 refactor maintains v1.0 functionality (keyword detection still works)
- [ ] **Performance Baseline**: Capture v1.0 performance metrics for v2.0 comparison

### v2.0 Architecture
- [ ] **Metafield Schema**: Confirm `custom.subscription_type` format with stakeholders: `{interval}_{count}_{addonType}`
- [ ] **Add-On Configuration**: Verify add-on map structure supports all planned add-on types
- [ ] **Privacy Compliance**: Review analytics sanitization logic with legal team (GDPR requirements)
- [ ] **Performance Budget**: Confirm <500KB total bundle size is acceptable for v2.0 scope

### Business Validation
- [ ] **Upsell Conversion Target**: Validate 8% quarterly→annual conversion is realistic (check historical data)
- [ ] **Cart Abandonment Target**: Confirm -15% reduction is achievable (benchmark against industry)
- [ ] **Support Ticket Baseline**: Capture current ticket volume for -40% reduction measurement

### Technical Dependencies
- [ ] **Shopify API Limits**: Verify Storefront API rate limits support price lookup at scale
- [ ] **Analytics API Availability**: Confirm shopify.analytics.publish() is available in API 2025-10
- [ ] **Cart Update API**: Verify shopify.cart.updateLineItem() works in checkout context (not just cart)

**Scope Boundaries**:

- **IN SCOPE**: Generic add-on system, real-time messaging, upsells, analytics, value display, A/B testing framework
- **OUT OF SCOPE**: Merchant admin UI (configuration via code/metafields only), external analytics integrations (v2.1), custom merchant-defined events (v2.2)
- **DEFERRED**: Auto-promoting A/B test winners (v2.2), cross-sell upsells (v2.1), bundle pricing (v2.1)

**Risk Acknowledgments**:

- ⚠️ **High Complexity**: v2.0 is 3-4× scope of v1.0 (23 days vs. 8 days)
- ⚠️ **Privacy Risk**: Analytics tracking requires careful GDPR compliance (legal review mandatory)
- ⚠️ **Performance Risk**: Adding features while maintaining <500KB bundle requires optimization discipline
- ⚠️ **Merchant Adoption**: Configuration complexity may require more extensive onboarding than v1.0

---

**Constitutional Compliance Check**: ✅ PASSED  
- Shopify Approval: Optional chaining, graceful degradation, accessibility, mobile-first ✅  
- API Version: Preact JSX pattern specified for 2025-10 ✅  
- Debugging Protocol: Test plan follows environment → build → code order ✅  
- Configuration Over Code: Metafield-driven design ✅  
- Privacy by Design: PII sanitization mandatory ✅  
- Performance Budget: <500KB total, <100ms render ✅  

**Specification Version**: 2.0.0 (Draft)  
**Supersedes**: v1.0.0 (Included Glassware Messaging)  
**Next Review Date**: 2025-10-09 (or upon stakeholder feedback)  
**Estimated Implementation**: 23 days (1-2 developers)

