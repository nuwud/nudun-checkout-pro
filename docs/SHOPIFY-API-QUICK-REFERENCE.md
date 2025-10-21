# 🚀 Shopify API 2025-10 Quick Reference Card

**Print this out and keep at your desk!**

---

## ⚡ 60-Second API Overview

**API Version**: 2025-10  
**Framework**: Preact (NOT React)  
**Checkout Target**: `purchase.checkout.block.render`  
**Component Model**: JSX with `<s-*>` web components  

---

## ✅ CORRECT Patterns

### 1. Extension Entry Point
```jsx
import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default async () => {
  render(<Extension />, document.body);
};
```

### 2. Accessing Cart Data
```jsx
// ✅ Use optional chaining on all nested access
const total = shopify?.cost?.totalAmount?.value;
const amount = total?.amount;        // String: "125.00"
const currency = total?.currencyCode; // String: "USD"

// ✅ Loop through line items safely
const lines = shopify?.lines?.value || [];
lines.forEach(line => {
  const title = line?.merchandise?.title;      // ✅ Product title
  const isSub = line?.merchandise?.sellingPlan != null; // ✅ Is subscription
});
```

### 3. Subscription Detection
```jsx
// ✅ Check for selling plan
const isSubscription = line?.merchandise?.sellingPlan != null;

// ✅ Get subscription frequency
const interval = line?.merchandise?.sellingPlan?.recurringDeliveries?.interval;
// Returns: "DAY" | "WEEK" | "MONTH" | "YEAR"
```

### 4. Rendering UI
```jsx
// ✅ Use Polaris web components
<s-banner tone="success">
  <s-heading>Title Here</s-heading>
  <s-text>Description text</s-text>
</s-banner>

// ✅ Valid tone values
tone="success"   // Green
tone="warning"   // Yellow
tone="critical"  // Red
tone="info"      // Blue
```

---

## ❌ WRONG Patterns (Will Cause Errors!)

### DON'T: Use React/Old API Patterns
```jsx
// ❌ WRONG - Old 2024-10 and earlier pattern
export default (root) => {
  const banner = root.createComponent('Banner', {...});
};

// ❌ WRONG - React, not Preact
import React from 'react';
import { Button } from '@shopify/polaris';
```

### DON'T: Access Non-Existent Properties
```jsx
// ❌ WRONG - These don't exist
line.title                              // CartLine has NO title
line.merchandise.product.title          // No product object
line.merchandise.variantTitle           // Not exposed

// ✅ CORRECT
line.merchandise.title                  // This exists!
```

### DON'T: Handle Money Objects as Numbers
```jsx
// ❌ WRONG - Amount is string, not number
const total = shopify.cost.totalAmount.value.amount + 10;  // NaN!

// ✅ CORRECT - Parse if doing math
const amount = parseFloat(shopify.cost.totalAmount.value.amount);
const newTotal = amount + 10;

// ✅ OR - Just display as string
const display = `$${shopify.cost.totalAmount.value.amount}`;
```

### DON'T: Skip Null Checks
```jsx
// ❌ WRONG - Crashes if any level is null
const interval = shopify.lines.value[0].merchandise.sellingPlan.recurringDeliveries.interval;

// ✅ CORRECT - Optional chaining
const interval = shopify?.lines?.value?.[0]?.merchandise?.sellingPlan?.recurringDeliveries?.interval;
```

---

## 🔍 What's Available in the `shopify` Global

### Cart Data ✅
```javascript
shopify.lines.value                  // CartLine[]
shopify.cost.totalAmount.value       // MoneyV2 {amount, currencyCode}
shopify.cost.subtotalAmount.value    // MoneyV2
shopify.cost.totalTaxAmount.value    // MoneyV2
shopify.cost.totalShippingAmount.value // MoneyV2
shopify.discountCodes.value          // string[]
```

### Customer Data ✅
```javascript
shopify.shippingAddress.value        // {countryCode, ...}
shopify.billingAddress.value         // {countryCode, ...}
shopify.customer.value               // {email, phone, firstName, ...}
```

### Session & Auth ✅
```javascript
shopify.sessionToken                 // JWT token for verification
```

### What DOESN'T Exist ❌
```javascript
shopify.lines.value[0].title         // CartLine has NO title
line.merchandise.product             // No product object
shopify.store.name                   // Store info not available
shopify.themes                       // Theme API not in checkout
```

---

## 💰 Money Object Quick Reference

### Structure
```javascript
{
  amount: "125.00",           // ← STRING, not number
  currencyCode: "USD"         // ← ISO 4217 code
}
```

### Common Locations
```javascript
shopify.cost.totalAmount.value           // Cart total
shopify.cost.subtotalAmount.value        // Before tax/shipping
shopify.cost.totalTaxAmount.value        // Tax only
shopify.cost.totalShippingAmount.value   // Shipping only
line.cost.totalAmount.value              // Individual line total
```

### Formatting Examples
```javascript
// Get the object
const money = shopify?.cost?.totalAmount?.value;

// Extract values safely
const amount = money?.amount || '0.00';
const currency = money?.currencyCode || 'USD';

// Format for display
return <s-text>${amount} {currency}</s-text>;
// Output: $125.00 USD
```

---

## 🎨 Available Polaris Web Components

### Containers & Layout
- `<s-banner tone="...">` - Colored alert box
- `<s-stack direction="block|inline">` - Layout container

### Text & Display
- `<s-heading>` - Heading text
- `<s-text>` - Body text
- `<s-image src="...">` - Images

### Forms & Input
- `<s-button onClick={handler}>` - Clickable button
- `<s-checkbox onChange={handler}>` - Checkbox
- `<s-text-field onChange={handler}>` - Text input
- `<s-select onChange={handler}>` - Dropdown

### Navigation
- `<s-link href="/path">` - Navigation link

### NOT Available in Checkout ❌
- `<s-page>` - Page layout (admin only)
- `<s-card>` - Card container
- `<s-table>` - Table component
- `<s-modal>` - Modal dialog
- React Polaris components like `<Button>` or `<Banner>`

---

## 📦 CartLine Object Reference

### Key Properties ✅
```javascript
CartLine = {
  id: string,                    // Line item ID
  quantity: number,              // How many
  merchandise: {
    title: string,               // ✅ Product title
    image: { src, alt },         // Product image
    sku: string | null,          // SKU
    requiresShipping: boolean,   // Ships or not
    sellingPlan: {               // ✅ Subscription
      id: string,
      name: string,
      recurringDeliveries: {
        interval: "DAY"|"WEEK"|"MONTH"|"YEAR",
        intervalCount: number    // 1=every, 2=every other
      }
    } | null
  },
  cost: {
    totalAmount: { amount, currencyCode },
    subtotalAmount: { amount, currencyCode },
    totalDiscountAmount: { amount, currencyCode }
  },
  attribute: [{key, value}],     // Custom attributes
  discountAllocations: [...]     // Applied discounts
}
```

### What DOESN'T Exist ❌
```javascript
line.title                              // NO
line.merchandise.product                // NO
line.merchandise.variantTitle           // NO
line.merchandise.product.handle         // NO (use GraphQL)
```

---

## 🔄 Subscription Detection Pattern

```jsx
function detectSubscription(line) {
  const sellingPlan = line?.merchandise?.sellingPlan;
  if (!sellingPlan) return null;
  
  const interval = sellingPlan.recurringDeliveries?.interval;
  return {
    isSubscription: true,
    interval: interval?.toLowerCase(),  // "day", "week", "month", "year"
    frequency: sellingPlan.recurringDeliveries?.intervalCount
  };
}

// Usage
const sub = detectSubscription(line);
if (sub?.isSubscription) {
  console.log(`Subscription: Every ${sub.frequency} ${sub.interval}`);
  // "Subscription: Every 1 month" for monthly sub
}
```

---

## 🚨 TypeScript Error Quick Fixes

### Error: "Property 'title' does not exist on type 'CartLine'"
```javascript
// ❌ WRONG
line.title

// ✅ CORRECT
line.merchandise.title
```

### Error: "Cannot add property 'title', object is not extensible"
```javascript
// ❌ WRONG - Mutating frozen objects
shopify.lines.value[0].title = "New Title";

// ✅ CORRECT - Create new object
const newLine = {
  ...line,
  customData: "New Value"
};
```

### Error: "shopify is not defined"
```javascript
// ✅ Solution 1: Add @ts-ignore
// @ts-ignore - shopify provided by Shopify runtime
const lines = shopify.lines.value;

// ✅ Solution 2: Use optional chaining
const lines = shopify?.lines?.value || [];
```

---

## 🧪 Testing Checklist

Before deploying to production:

- [ ] ✅ Renders without errors
- [ ] ✅ Annual subscription shows correct message
- [ ] ✅ Quarterly subscription works
- [ ] ✅ Non-subscription products hide banner
- [ ] ✅ Mobile viewport responsive
- [ ] ✅ No console errors (F12 Developer Tools)
- [ ] ✅ Keyboard navigation works
- [ ] ✅ Screen reader reads content
- [ ] ✅ Money values display correctly
- [ ] ✅ No TypeScript build errors

---

## 🔗 Critical Links

**Bookmark These**:
- API Docs: https://shopify.dev/docs/api/checkout-ui-extensions/latest
- Changelog: https://shopify.dev/docs/api/checkout-ui-extensions/changelog
- GraphQL API: https://shopify.dev/docs/api/admin-graphql
- Web Components: https://shopify.dev/docs/api/app-home/polaris-web-components
- Preact: https://preactjs.com/

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Not a function" error | Check export: `export default async () => { render(...) }` |
| Component doesn't appear | 1. Refresh checkout 2. Drag extension into layout 3. Check console |
| "[object Object]" displays | Money object as string: use `money.amount` not `money` |
| Product title undefined | Use `line.merchandise.title` not `line.title` |
| Price shows null | Check GraphQL query succeeded + property path correct |
| Mobile looks broken | Add responsive classes, test with mobile browser |
| TypeScript errors | Add `@ts-ignore` OR use optional chaining `?.` |

---

## 📌 Remember!

1. **ALWAYS use optional chaining** (`?.`) for nested objects
2. **Money amounts are STRINGS** (`"125.00"`, not `125.00`)
3. **Product titles are at** `line.merchandise.title`
4. **Subscriptions detected via** `line?.merchandise?.sellingPlan`
5. **Export pattern** `export default async () => { render(...) }`
6. **Import from** `@shopify/ui-extensions/preact` (NOT `/checkout`)
7. **Use only** `<s-*>` web components (NOT React Polaris)

---

**API Version**: 2025-10  
**Last Updated**: 2025-10-21  
**Print Date**: _______________
