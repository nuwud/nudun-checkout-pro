# SPEC-KIT: NUDUN Checkout Pro Technical Specifications

## Overview
This document contains critical technical patterns and architectural decisions for NUDUN Checkout Pro development.

---

## Checkout Extension API Patterns (2025-10)

### Money Object Pattern ⚠️ CRITICAL

**Problem**: `shopify.cost.totalAmount.value` returns a **Money object**, NOT a plain number.

**Money Object Structure**:
```typescript
interface Money {
  amount: string;      // e.g., "125.00"
  currencyCode: string; // e.g., "USD", "EUR", "CAD"
}
```

**✅ CORRECT Implementation**:
```jsx
function Extension() {
  // Get Money object from shopify global
  const totalAmountObj = shopify?.cost?.totalAmount?.value;
  
  // Graceful fallback if unavailable
  if (!totalAmountObj) {
    return null;
  }
  
  // Extract properties separately
  const amount = totalAmountObj.amount || '0.00';
  const currency = totalAmountObj.currencyCode || 'USD';
  
  // Display with dollar sign (hardcoded) or currency code
  return <s-text>Total: ${amount}</s-text>;           // Shows: $125.00
  // OR
  return <s-text>Total: {currency} {amount}</s-text>; // Shows: USD 125.00
}
```

**❌ WRONG - Common Mistakes**:
```jsx
// WRONG #1: Treating Money object as a number
const total = shopify.cost.totalAmount.value;
return <s-text>Total: ${total}</s-text>; // Shows: "[object Object]"

// WRONG #2: Using template literals in JSX
return <s-text>Total: ${amount}</s-text>; // Won't interpolate in JSX

// WRONG #3: Accessing currencyCode directly from .value
const currency = shopify?.cost?.totalAmount?.value?.currencyCode; // Type error
```

**Common Money Object Locations**:
- `shopify.cost.totalAmount.value` - Cart total (including tax/shipping)
- `shopify.cost.subtotalAmount.value` - Subtotal (before tax/shipping)
- `shopify.cost.totalTaxAmount.value` - Total tax amount
- `shopify.cost.totalShippingAmount.value` - Shipping cost
- `line.cost.totalAmount.value` - Individual line item total
- `line.cost.compareAtAmount.value` - Compare-at price (for discounts)

**Currency Display Options**:
1. **Hardcoded symbol**: `${amount}` - Simple, but not multi-currency
2. **Currency code**: `{currency} {amount}` - Multi-currency safe
3. **Symbol lookup**: Create currency map for symbols (€, £, ¥, etc.)

---

## Extension Code Pattern (Preact JSX)

**Complete Working Example**:
```jsx
import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  // Access checkout data with optional chaining
  const totalAmountObj = shopify?.cost?.totalAmount?.value;
  const itemCount = shopify?.lines?.value?.length || 0;
  
  // Graceful degradation
  if (!totalAmountObj) {
    return null;
  }
  
  // Extract Money object properties
  const amount = totalAmountObj.amount || '0.00';
  
  return (
    <s-banner tone="info">
      <s-heading>NUDUN Checkout Pro</s-heading>
      <s-text>
        Your cart contains {itemCount} {itemCount === 1 ? 'item' : 'items'} totaling ${amount}
      </s-text>
    </s-banner>
  );
}
```
## Performance Standards
- **Extension Load Time**: <100ms
- **API Response Time**: <200ms
- **Bundle Size**: <500KB per extension
- **Lighthouse Score**: >90 for embedded app

## Deployment Pipeline
- **Development**: `npm run dev` with hot reloading
- **Staging**: Manual deployment for testing
- **Production**: CI/CD with automated testing
- **Rollback**: Automated rollback capability
