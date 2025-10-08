# Money Object Pattern - Critical Reference

## Quick Summary
**Problem Solved**: Extension wasn't displaying dollar amounts correctly because `shopify.cost.totalAmount.value` returns a Money object, not a number.

**Solution**: Extract `amount` and `currencyCode` properties separately from the Money object.

---

## The Money Object Structure

```typescript
interface Money {
  amount: string;      // "125.00" (always a string)
  currencyCode: string; // "USD", "EUR", "CAD", etc.
}
```

---

## ✅ CORRECT Pattern (Current Implementation)

```jsx
function Extension() {
  // Get the Money object
  const totalAmountObj = shopify?.cost?.totalAmount?.value;
  
  // Guard clause for safety
  if (!totalAmountObj) {
    return null;
  }
  
  // Extract the amount property
  const amount = totalAmountObj.amount || '0.00';
  
  // Display with hardcoded dollar sign
  return <s-text>Total: ${amount}</s-text>; // Shows: $125.00
}
```

**Result**: Extension displays "Your cart contains 1 item totaling $125.00" ✅

---

## ❌ Common Mistakes to Avoid

### Mistake #1: Treating Money as a Number
```jsx
// WRONG
const total = shopify.cost.totalAmount.value;
return <s-text>${total}</s-text>; // Shows "[object Object]"
```

### Mistake #2: Using Template Literals in JSX
```jsx
// WRONG - JSX doesn't support ${} syntax
const amount = totalAmountObj.amount;
return <s-text>Total: ${amount}</s-text>; // Won't interpolate
```

**Fix**: Use curly braces for variables in JSX:
```jsx
// CORRECT
return <s-text>Total: ${amount}</s-text>; // $ is literal, {amount} interpolates
```

### Mistake #3: Accessing Properties Directly
```jsx
// WRONG - Type error
const currency = shopify?.cost?.totalAmount?.value?.currencyCode;
```

**Fix**: First get the object, then access properties:
```jsx
// CORRECT
const totalAmountObj = shopify?.cost?.totalAmount?.value;
const currency = totalAmountObj?.currencyCode || 'USD';
```

---

## All Money Object Locations in Shopify API

### Cart-Level
- `shopify.cost.totalAmount.value` - **Cart total** (with tax/shipping)
- `shopify.cost.subtotalAmount.value` - **Subtotal** (before tax/shipping)
- `shopify.cost.totalTaxAmount.value` - **Total tax**
- `shopify.cost.totalShippingAmount.value` - **Shipping cost**

### Line Item Level
- `line.cost.totalAmount.value` - **Line item total**
- `line.cost.compareAtAmount.value` - **Compare-at price** (for showing discounts)

### Discount Level
- `discount.amount.value` - **Discount amount applied**

---

## Currency Display Options

### Option 1: Hardcoded Dollar Sign (Current)
```jsx
<s-text>Total: ${amount}</s-text>
// Shows: $125.00
// Pros: Simple, clean
// Cons: Only works for USD
```

### Option 2: Currency Code
```jsx
const currency = totalAmountObj.currencyCode || 'USD';
<s-text>Total: {currency} {amount}</s-text>
// Shows: USD 125.00
// Pros: Multi-currency support
// Cons: Less visually appealing
```

### Option 3: Currency Symbol Map (Future Enhancement)
```jsx
const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'CA$',
  // ... more currencies
};

const currency = totalAmountObj.currencyCode || 'USD';
const symbol = currencySymbols[currency] || currency;
<s-text>Total: {symbol}{amount}</s-text>
// Shows: $125.00, €125.00, £125.00, etc.
// Pros: Best of both worlds
// Cons: Requires maintenance of symbol map
```

---

## When to Use Each Approach

| Scenario | Recommended Approach | Example |
|----------|---------------------|---------|
| **US-only stores** | Hardcoded `$` | `${amount}` |
| **Multi-currency stores** | Currency code or symbol map | `{currency} {amount}` |
| **Global marketplace** | Symbol map with fallback | `{symbol}{amount}` |
| **B2B with currency selection** | Currency code (clearer) | `{currency} {amount}` |

---

## Testing Checklist

When working with Money objects:

- [ ] Test with different currencies (USD, EUR, GBP, CAD, etc.)
- [ ] Test with zero amounts (`0.00`)
- [ ] Test with large amounts (`9999999.99`)
- [ ] Test with decimals (`125.50`, `99.99`)
- [ ] Test when cart is empty (`totalAmountObj` is null/undefined)
- [ ] Test with different locales (some use commas vs periods)
- [ ] Verify no `[object Object]` displays
- [ ] Verify currency symbol/code displays correctly

---

## Future Enhancements

### 1. Locale-Aware Formatting
```jsx
// Use Intl.NumberFormat for proper formatting
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: totalAmountObj.currencyCode
});

const formatted = formatter.format(parseFloat(totalAmountObj.amount));
// Automatically formats: $125.00, €125,00, etc.
```

### 2. Dynamic Currency Symbols
```jsx
// Load from merchant configuration or i18n
const symbol = shopify.i18n.translate(`currency.${currency}.symbol`);
```

### 3. Comparison Display (Savings)
```jsx
const regular = line.cost.compareAtAmount.value;
const sale = line.cost.totalAmount.value;

if (regular && parseFloat(regular.amount) > parseFloat(sale.amount)) {
  const savings = (parseFloat(regular.amount) - parseFloat(sale.amount)).toFixed(2);
  return <s-text>Save ${savings}!</s-text>;
}
```

---

## Documentation References

- Updated in `.github/copilot-instructions.md` - Section: "CRITICAL: Money Object Pattern"
- Updated in `SPEC-KIT.md` - Complete technical spec
- Implementation in `extensions/nudun-messaging-engine/src/Checkout.jsx`

---

**Last Updated**: October 7, 2025  
**Status**: ✅ Working - Extension displays "$125.00" correctly  
**Next Steps**: Consider multi-currency support when expanding internationally
