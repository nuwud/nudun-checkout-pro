# 📋 Shopify API Contract Reference (2025-10)

**Last Updated**: October 21, 2025  
**API Version**: 2025-10  
**Extension Target**: purchase.checkout.block.render  
**Framework**: Preact with JSX  

---

## 🎯 Quick Reference - What Shopify API 2025-10 Actually Provides

### ✅ Extension Configuration (`shopify.extension.toml`)
```toml
api_version = "2025-10"                    # ✅ Requires Preact JSX (NOT vanilla JS)
target = "purchase.checkout.block.render"  # ✅ Block-level checkout rendering
module = "./src/Checkout.jsx"              # ✅ JSX entry point
```

**Why This Matters**: 
- API 2024-10 and earlier used vanilla JS API with `root.createComponent()`
- API 2025-10 switched to Preact JSX with `render()` function
- This is a breaking change that affects all code patterns

---

## 🔍 The `shopify` Global - Type Contract

### What Exists ✅
```javascript
shopify.lines.value                              // ✅ CartLine[]
shopify.cost.totalAmount.value                   // ✅ MoneyV2 { amount, currencyCode }
shopify.cost.subtotalAmount.value                // ✅ MoneyV2 { amount, currencyCode }
shopify.cost.totalTaxAmount.value                // ✅ MoneyV2 { amount, currencyCode }
shopify.cost.totalShippingAmount.value           // ✅ MoneyV2 { amount, currencyCode }
shopify.shippingAddress.value                    // ✅ Address { countryCode, ... }
shopify.discountCodes.value                      // ✅ String[] of discount codes
shopify.sessionToken                             // ✅ JWT for merchant verification
```

### What DOES NOT Exist ❌
```javascript
line.title                                       // ❌ CartLine has NO title property
line.merchandise.title                           // ❌ Merchandise has NO title property
line.merchandise.product.title                   // ❌ Product has NO title property
line.merchandise.product.handle                  // ❌ Handle NOT directly accessible
line.merchandise.variantTitle                    // ❌ Variant title not available
```

**Why**: Shopify restricts checkout API to performance-critical data only. Product metadata requires separate GraphQL query.

---

## 📦 CartLine Object - Complete Type Contract

### Available Properties ✅
```javascript
CartLine = {
  id: string,                                    // ✅ Unique line ID
  cost: {
    totalAmount: { amount: string, currencyCode: string },  // ✅ Line total
    subtotalAmount: { amount: string, currencyCode: string },// ✅ Before discounts
    amountPerQuantity: { amount: string, currencyCode: string },
    totalDiscountAmount: { amount: string, currencyCode: string }
  },
  attribute: {
    key: string,
    value: string | null
  }[],                                           // ✅ Custom cart attributes
  discountAllocations: [...],                    // ✅ Applied discounts
  quantity: number,                              // ✅ Line quantity
  merchandise: {
    id: string,
    image: {
      src: string,
      alt: string | null
    } | null,
    requiresShipping: boolean,
    sellingPlan: {                               // ✅ Subscription info
      id: string,
      name: string,
      recurringDeliveries: {
        interval: "DAY" | "MONTH" | "WEEK" | "YEAR",
        intervalCount: number
      },
      billingPolicy: { interval: string, intervalCount: number },
      deliveryPolicy: { interval: string, intervalCount: number }
    } | null,
    sku: string | null,
    weight: { unit: string, value: number } | null,
    title: string | null                         // ⚠️ Available on Merchandise
  }
}
```

### Key Discovery - `merchandise.title` EXISTS ✅
**Update (2025-10-21)**: The `merchandise.title` IS available! 

Correct Access Pattern:
```javascript
line.merchandise.title  // ✅ Returns product title
```

Incorrect Patterns (DO NOT USE):
```javascript
line.title  // ❌ CartLine object has no title
line.merchandise.product.title  // ❌ No product object on merchandise
line.merchandise.variantTitle  // ❌ Variant title not exposed
```

---

## 💰 Money Object (MoneyV2) - Type Contract

### Structure ✅
```javascript
MoneyV2 = {
  amount: string,           // ✅ Amount as string decimal (e.g., "125.00")
  currencyCode: string      // ✅ ISO 4217 code (e.g., "USD", "EUR", "CAD")
}
```

### Important Notes
- `amount` is **STRING**, not number (avoid `parseInt()` errors)
- Currency codes are **ISO 4217 standard** (not Shopify-specific)
- Always use optional chaining: `shopify?.cost?.totalAmount?.value?.amount`

### Formatting Example
```javascript
const total = shopify?.cost?.totalAmount?.value;
const formatted = `${total?.amount} ${total?.currencyCode}`;  // "125.00 USD"
```

---

## 🎨 Polaris Web Components - 2025-10 Availability

### ✅ Confirmed Available
```jsx
<s-banner tone="success|warning|critical|info">       // ✅ Alert container
<s-heading>                                            // ✅ Heading text
<s-text>                                               // ✅ Body text
<s-stack direction="block|inline">                     // ✅ Layout container
<s-button onClick={handler}>                           // ✅ Button
<s-image src="url">                                    // ✅ Images
<s-checkbox onChange={handler}>                        // ✅ Checkboxes
<s-text-field onChange={handler}>                      // ✅ Text input
<s-select onChange={handler}>                          // ✅ Dropdown
<s-link href="/path">                                  // ✅ Navigation links
```

### ❌ NOT Available in Checkout
```jsx
<s-modal>          // ❌ Modals not supported in checkout
<s-page>           // ❌ Page layout for admin only
<s-card>           // ❌ Card component not in checkout API
<s-table>          // ❌ Tables not in checkout
<s-menu>           // ❌ Menus not in checkout
```

---

## 🔗 Subscription Detection - API Pattern

### Selling Plan Object ✅
```javascript
merchandise.sellingPlan = {
  id: string,
  name: string,              // e.g., "Annual subscription"
  recurringDeliveries: {
    interval: "DAY"|"MONTH"|"WEEK"|"YEAR",
    intervalCount: number     // 1 = every interval, 2 = every other interval
  },
  billingPolicy: { interval: string, intervalCount: number },
  deliveryPolicy: { interval: string, intervalCount: number }
}
```

### Detection Pattern ✅
```javascript
function isSubscription(line) {
  return line?.merchandise?.sellingPlan != null;  // ✅ Correct
}

function getInterval(line) {
  const interval = line?.merchandise?.sellingPlan?.recurringDeliveries?.interval;
  return interval?.toLowerCase();  // "day", "month", "week", "year"
}
```

---

## 🚀 Export Pattern - CRITICAL for 2025-10

### ✅ CORRECT - Preact JSX Pattern
```jsx
import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  return <s-banner><s-text>Hello</s-text></s-banner>;
}
```

**Why `async`?**
- Allows time for Shopify to inject the `shopify` global
- Prevents race conditions on data access
- Ensures extension renders after checkout context ready

### ❌ WRONG - Vanilla JS Pattern (2024-10 and earlier)
```javascript
// This API does NOT exist in 2025-10
export default (root) => {
  const banner = root.createComponent('Banner', {...});
  root.appendChild(banner);
};
```

---

## 📡 GraphQL API Access - Pattern

### Enable in `shopify.extension.toml`
```toml
[extensions.capabilities]
api_access = true  # ✅ Allows GraphQL queries
```

### Query Pattern ✅
```javascript
const response = await shopify.admin.query({
  query: `#graphql
    query GetProduct($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        priceRange {
          minVariantPrice { amount currencyCode }
        }
      }
    }
  `,
  variables: { handle: "premium-glass" }
});

const product = await response.json();
```

### Important Notes
- Queries are **batched** (max ~5 per second recommended)
- Returns JSON via `response.json()`
- Errors included in response (check `errors` field)
- Session token auto-included for authorization

---

## ⚠️ Common Pitfalls & Fixes

### Pitfall 1: Accessing Product Title
```javascript
// ❌ WRONG - These don't exist
line.title
line.merchandise.product.title
line.merchandise.variantTitle

// ✅ CORRECT - Merchandise title exists
line.merchandise.title

// ✅ BEST - For product info, use GraphQL query
const response = await shopify.admin.query({
  query: `query { productByHandle(handle: "${productHandle}") { ... } }`
});
```

### Pitfall 2: Money Object Handling
```javascript
// ❌ WRONG - Amount is string, not number
const price = shopify.cost.totalAmount.value.amount + 10;  // NaN!

// ✅ CORRECT - Parse as number or work with strings
const amount = parseFloat(shopify.cost.totalAmount.value.amount) + 10;
const formatted = `$${amount}`;
```

### Pitfall 3: Null Safety on Nested Objects
```javascript
// ❌ WRONG - Crashes if any level is null
const interval = shopify.lines.value[0].merchandise.sellingPlan.recurringDeliveries.interval;

// ✅ CORRECT - Use optional chaining
const interval = shopify?.lines?.value?.[0]?.merchandise?.sellingPlan?.recurringDeliveries?.interval;
```

### Pitfall 4: Module Import Path
```javascript
// ❌ WRONG - Old API path
import { render } from '@shopify/ui-extensions/checkout';

// ✅ CORRECT - New API path
import { render } from '@shopify/ui-extensions/preact';
```

---

## 🔄 Shopify API Version Timeline

| Version | Release | Framework | Export Pattern | Status |
|---------|---------|-----------|-----------------|--------|
| 2024-07 | 2024-Q3 | Vanilla JS | `export default (root) => { ... }` | ⛔ Deprecated |
| 2024-10 | 2024-Q4 | Vanilla JS | `export default (root) => { ... }` | ⚠️ Legacy |
| 2025-01 | 2025-Q1 | Preact | `export default async () => { render(...) }` | ✅ Current |
| 2025-04 | 2025-Q2 | Preact | `export default async () => { render(...) }` | ✅ Current |
| 2025-10 | 2025-Q4 | Preact | `export default async () => { render(...) }` | ✅ **LATEST** |

**How to Update**:
1. Check `api_version` in `shopify.extension.toml`
2. Visit `https://shopify.dev/docs/api/checkout-ui-extensions/[VERSION]`
3. If switching versions, update all import paths and export patterns
4. Rebuild and test in dev store

---

## ✅ Pre-Deployment Validation Checklist

Before deploying extensions to production:

### Configuration
- [ ] `api_version = "2025-10"` in `shopify.extension.toml`
- [ ] `module = "./src/Checkout.jsx"` points to correct entry
- [ ] `target = "purchase.checkout.block.render"` is correct target

### Import Statements
- [ ] `import '@shopify/ui-extensions/preact'` (NOT `/checkout`)
- [ ] `import { render } from 'preact'` (NOT React)
- [ ] No default React imports

### Export Pattern
- [ ] `export default async () => { ... }` (async, function)
- [ ] Calls `render(<Component />, document.body)`
- [ ] NOT `export default (root) => { ... }` (vanilla JS)

### Type Safety
- [ ] `@ts-ignore` comments only for `shopify` global
- [ ] No `line.title` access (use `line.merchandise.title`)
- [ ] Optional chaining on all nested objects
- [ ] No hardcoded assumptions about API responses

### Component Usage
- [ ] Uses only `<s-*>` web components
- [ ] No React Polaris components
- [ ] Tone props: `"success"`, `"warning"`, `"critical"`, `"info"`
- [ ] Kebab-case attributes (e.g., `onClick`, `onChange`)

### Data Handling
- [ ] Money amounts treated as strings
- [ ] Subscription detection via `sellingPlan` object
- [ ] Graceful fallbacks for missing data
- [ ] No console errors in dev tools

### Testing
- [ ] Component renders without errors
- [ ] Mobile viewport works correctly
- [ ] Accessible via keyboard navigation
- [ ] No TypeScript errors in build
- [ ] All tests passing

---

## 📚 Reference URLs

**Official Shopify Docs** (Always check for your API version):
- https://shopify.dev/docs/api/checkout-ui-extensions/latest
- https://shopify.dev/docs/api/checkout-ui-extensions/latest/apis/cartline-api
- https://shopify.dev/docs/api/checkout-ui-extensions/latest/extension-targets-overview
- https://shopify.dev/docs/api/app-home/polaris-web-components

**GraphQL Admin API**:
- https://shopify.dev/docs/api/admin-graphql

**Preact Documentation**:
- https://preactjs.com/

**Shopify CLI**:
- https://shopify.dev/docs/apps/tools/cli

---

## 🚨 When API Changes Break Your Code

### Step 1: Verify Current API Version
```bash
cat shopify.extension.toml | grep api_version
```

### Step 2: Check Shopify Changelog
Visit: https://shopify.dev/docs/api/checkout-ui-extensions/changelog

### Step 3: Review Breaking Changes
- [ ] New required imports?
- [ ] Export pattern changed?
- [ ] Components removed/renamed?
- [ ] Global API properties added/removed?

### Step 4: Update Code
- [ ] Update imports
- [ ] Update export pattern
- [ ] Remove deprecated components
- [ ] Test thoroughly

### Step 5: Validate
```bash
npm run typecheck     # Catch type errors
npm run build         # Verify build succeeds
npm run test          # Run test suite
npm run dev           # Test in dev store
```

---

## 📝 How to Stay Current

### Daily/Weekly
1. Subscribe to Shopify API changelog: https://shopify.dev/api-admin-releases
2. Monitor GitHub releases: https://github.com/Shopify/ui-extensions/releases
3. Check npm package updates: `npm outdated`

### Before Each Release
1. Run `npm audit` to check for vulnerabilities
2. Review `CHANGELOG.md` in dependencies
3. Test with latest package versions
4. Update `shopify.extension.toml` if needed

### When Adding Features
1. Check if feature exists in current API version
2. Verify Shopify documentation for that version
3. Add comments linking to official docs
4. Test edge cases and error conditions

---

**Last Validated**: 2025-10-21 with API 2025-10  
**Next Review**: When Shopify releases API 2026-01 or newer
