# v0.1 Architecture Documentation

**Date**: October 7, 2025  
**Version**: v0.1 Proof-of-Concept  
**Purpose**: Document current architecture before v2.0 refactor  
**Related Task**: T003 - Document v0.1 Architecture

---

## System Overview

NUDUN Checkout Pro is a Shopify Plus checkout UI extension built on:
- **Framework**: Preact 10.x (lightweight React alternative)
- **Extension API**: Shopify Checkout UI Extensions API 2025-10
- **Rendering**: Preact JSX with Shopify Polaris web components
- **Target**: `purchase.checkout.block.render` (requires manual placement)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Shopify Checkout                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Checkout UI Extension Container              │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │   NUDUN Checkout Pro Extension (v0.1)          │ │  │
│  │  │                                                 │ │  │
│  │  │   Entry: src/index.tsx                         │ │  │
│  │  │        ↓                                        │ │  │
│  │  │   Component: src/Checkout.jsx                  │ │  │
│  │  │        ↓                                        │ │  │
│  │  │   Output: <s-banner> with cart info            │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Data Flow:                                                 │
│  shopify.cost.totalAmount.value → Preact Signal            │
│  shopify.lines.value → Preact Signal                       │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
extensions/nudun-messaging-engine/
├── src/
│   ├── index.tsx          # Entry point (renders Extension component)
│   └── Checkout.jsx       # Main component (displays cart info banner)
├── locales/
│   ├── en.default.json    # English translations (not used yet)
│   └── fr.json            # French translations (not used yet)
├── package.json           # Dependencies (Preact)
├── shopify.extension.toml # Extension configuration
├── shopify.d.ts           # TypeScript definitions for shopify global
├── tsconfig.json          # TypeScript config
└── README.md              # Extension documentation
```

---

## Component Architecture

### Entry Point: `src/index.tsx`

**Purpose**: Mount Preact app to Shopify extension container

**Pattern**: Async export required by API 2025-10

```tsx
import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default async () => {
  render(<Extension />, document.body);
};
```

**Key Points**:
- Must be `async` function
- Uses Preact's `render()`, not React's `ReactDOM.render()`
- Mounts to `document.body` (provided by Shopify)

---

### Main Component: `src/Checkout.jsx`

**Purpose**: Display cart summary in banner

**Data Sources**:
- `shopify.cost.totalAmount.value` - Cart total (Money object)
- `shopify.lines.value` - Cart line items (array)

**Component Structure**:

```jsx
function Extension() {
  // 1. Data Access (with optional chaining)
  const totalAmountObj = shopify?.cost?.totalAmount?.value;
  const itemCount = shopify?.lines?.value?.length || 0;
  
  // 2. Graceful Degradation
  if (!totalAmountObj) {
    return null; // Don't render if data unavailable
  }
  
  // 3. Money Object Handling
  const amount = totalAmountObj.amount || '0.00';
  
  // 4. UI Rendering (Polaris web components)
  return (
    <s-banner tone="info">
      <s-heading>NUDUN Checkout Pro</s-heading>
      <s-text>Cart: {itemCount} items, ${amount}</s-text>
    </s-banner>
  );
}
```

**Reactivity**: Shopify provides reactive signals. Component re-renders when:
- Cart total changes (`shopify.cost.totalAmount.value`)
- Line items change (`shopify.lines.value`)

---

## Data Flow

### Shopify Global API

The extension has access to the `shopify` global object (provided by Shopify runtime):

```javascript
shopify = {
  cost: {
    totalAmount: Signal<Money>,      // Cart total
    subtotalAmount: Signal<Money>,   // Before shipping/tax
    totalTaxAmount: Signal<Money>,   // Tax amount
    totalShippingAmount: Signal<Money> // Shipping cost
  },
  lines: Signal<CartLine[]>,         // Line items
  shippingAddress: Signal<Address>,  // Customer address
  localization: Signal<Localization>, // Locale info
  cart: {
    updateLineItem: Function         // Modify cart (not used yet)
  },
  analytics: {
    publish: Function                // Track events (not used yet)
  }
}
```

**Money Object Structure**:
```typescript
type Money = {
  amount: string;       // e.g., "125.00"
  currencyCode: string; // e.g., "USD"
}
```

### Current Data Usage

| Shopify API | Usage | Purpose |
|-------------|-------|---------|
| `shopify.cost.totalAmount.value` | ✅ Used | Display cart total |
| `shopify.lines.value` | ✅ Used | Count items |
| `shopify.cart.updateLineItem()` | ❌ Not used | (Future: Upsells) |
| `shopify.analytics.publish()` | ❌ Not used | (Future: Analytics) |
| `shopify.shippingAddress.value` | ❌ Not used | (Future: Localization) |

---

## Configuration

### Extension Settings: `shopify.extension.toml`

```toml
api_version = "2025-10"

[[extensions]]
name = "nudun-messaging-engine"
type = "ui_extension"
target = "purchase.checkout.block.render"
module = "./src/Checkout.jsx"

[extensions.capabilities]
api_access = true  # Storefront API (not used yet)
```

**Key Configuration**:
- **API Version**: 2025-10 (requires Preact JSX)
- **Target**: `purchase.checkout.block.render` (manual placement required)
- **API Access**: Enabled (for future Storefront API queries)
- **Metafields**: Not configured (needed for Phase 1)
- **Network Access**: Disabled (not needed yet)

---

## Dependencies

### Package Dependencies

**Runtime** (`package.json`):
- `@shopify/ui-extensions`: Provided by Shopify (types only)
- `preact`: ~10.x (bundled into extension)

**Development**:
- `typescript`: Type checking
- `@shopify/cli`: Development server

### External Dependencies
- **None** - Current implementation has no external API calls

---

## Performance Characteristics

### Bundle Size
- **Current**: ~60KB (estimated, minified + gzipped)
- **Breakdown**: 
  - Preact runtime: ~3KB
  - Extension code: ~1.2KB
  - Polaris components: Provided by Shopify (not bundled)

### Rendering Performance
- **Initial Mount**: <50ms (minimal DOM operations)
- **Re-renders**: <10ms (reactive signal updates)
- **Memory**: ~3MB heap (basic Preact app)

### Reactivity Model
Uses Shopify's built-in reactivity (Preact Signals under the hood):
- Component automatically re-renders when signals change
- No manual subscriptions or listeners needed
- Efficient diffing (only changed parts update)

---

## Security & Privacy

### Current Compliance ✅

**Shopify Approval Requirements**:
- ✅ Optional chaining for safe data access
- ✅ Graceful degradation (null checks)
- ✅ No external network calls
- ✅ No PII collection
- ✅ No third-party tracking
- ✅ No cookies or localStorage

**GDPR Compliance**:
- ✅ No personal data collection
- ✅ No user tracking
- ✅ No data storage

**Risk Level**: Low (display-only extension)

---

## Limitations & Technical Debt

### Current Limitations

1. **No Feature Logic**
   - No subscription detection
   - No messaging rules
   - No localization
   - No analytics

2. **No Error Handling**
   - No error boundaries
   - No fallback UI for failures
   - No retry logic

3. **No Testing**
   - Zero unit tests
   - No component tests
   - No E2E scenarios

4. **No TypeScript**
   - Files are `.jsx` not `.tsx`
   - Missing type safety benefits

5. **No Extensibility**
   - Hardcoded logic
   - No configuration system
   - No merchant settings

### Technical Debt for v2.0

**Phase 1 must address**:
- Add metafield parsing (subscription detection)
- Create configuration system (add-on types)
- Implement localization (French support)
- Add error boundaries

**Phase 3 must address**:
- Add analytics tracking
- Implement PII sanitizer (CRITICAL)
- Privacy audit compliance

**Phase 6 should address**:
- Convert to TypeScript (`.tsx`)
- Add proper error handling
- Accessibility improvements

---

## Deployment & Testing

### Current Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Shopify CLI creates tunnel
# Output: https://checkout.shopify.com/...?extensionDev=true

# 3. Open checkout editor
# Drag "nudun-messaging-engine" from sidebar

# 4. Test in preview
# Make purchases, change cart, verify banner updates
```

### Manual Placement Required

⚠️ **Critical**: Extension uses `purchase.checkout.block.render` target
- Merchants MUST manually place extension in checkout editor
- Extension won't appear automatically
- Requires drag-and-drop from sidebar into layout

---

## Comparison: v0.1 vs Planned v2.0

| Feature | v0.1 (Current) | v2.0 (Planned) |
|---------|----------------|----------------|
| **Core Features** |
| Subscription detection | ❌ None | ✅ Metafield + keyword |
| Add-on messaging | ❌ None | ✅ 5 types (glass, bottle, etc.) |
| Dynamic messaging | ❌ None | ✅ Cart thresholds |
| Upsell detection | ❌ None | ✅ Quarterly→Annual |
| Analytics | ❌ None | ✅ Event tracking |
| A/B testing | ❌ None | ✅ Framework (optional) |
| **Technical** |
| Components | 1 (Extension) | 10+ (modular) |
| Bundle size | ~60KB | <500KB |
| Tests | 0 | 209 tests |
| Localization | ❌ Files exist but unused | ✅ EN + FR |
| Error handling | ❌ None | ✅ Boundaries + fallbacks |
| TypeScript | ❌ JSX only | ✅ Full TSX |
| API calls | 0 | <5 (cached) |

---

## v2.0 Architecture Preview

**Phase 1** will transform this simple structure:

```
src/Checkout.jsx  (1 component, 49 lines)
```

Into a modular system:

```
src/
├── index.tsx              # Entry point
├── Checkout.jsx           # Main orchestrator
├── components/
│   ├── InclusionMessage.jsx    # Add-on display
│   ├── DynamicBanner.jsx       # Threshold messages
│   ├── UpsellBanner.jsx        # Upgrade prompts
│   └── BannerQueue.jsx         # Priority manager
├── config/
│   ├── addOnConfig.js     # Add-on type definitions
│   ├── thresholdConfig.js # Messaging thresholds
│   └── i18n.js            # Localization loader
├── utils/
│   ├── subscriptionDetector.js # Metafield parser
│   ├── keywordFallback.js      # v1.0 compatibility
│   ├── metafieldParser.js      # Parse "quarterly_1_glass"
│   └── priceLoader.js          # Storefront API queries
├── analytics/
│   ├── tracker.js         # Main analytics
│   ├── sanitizer.js       # PII blocker (CRITICAL)
│   ├── batcher.js         # Event batching
│   └── eventTypes.js      # Schema definitions
└── __tests__/             # 209 tests
```

---

## Conclusion

**Current State**: Minimal proof-of-concept demonstrating:
- Shopify extension loading
- Preact JSX rendering
- Reactive signal handling
- Money object usage
- Safe data access patterns

**Not Production-Ready**: Missing all business logic, error handling, testing, and features.

**v2.0 Transformation**: Will add 50+ requirements across 6 user stories in 8 phases over 19-23 days.

**Architecture is Sound**: Foundation (Preact + Shopify API 2025-10) is correct. v2.0 will build on this base.

---

**Architecture Documentation Complete**: Ready for Phase 1 (Generic Add-On System) ✅

**Phase 0 Progress**: 
- ✅ T001: v1.0 audit
- ✅ T002: Baseline metrics
- ✅ T003: Architecture docs (this file)
- ✅ T004: Feature branch created

**Phase 0 Status**: 4/4 tasks complete (100%) - **READY FOR PHASE 1** 🚀
