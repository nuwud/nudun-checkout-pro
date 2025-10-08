# Testing Upsell Banner - Debug Guide

## What Changed

**Previous Implementation** (BROKEN):
- Required external selling plan data (unavailable)
- Complex multi-plan comparison logic
- Always returned null (no upsells detected)

**New Implementation** (SHOULD WORK):
- Works with just current plan data
- Estimates upgrade savings using industry rates
- Shows upsells for monthly/quarterly subscriptions

## Before You Start

1. **Start dev server**:
   ```bash
   cd /c/Users/Nuwud/Projects/nudun-checkout-pro/nudun-checkout-pro
   npm run dev
   ```

2. **Open browser console** (F12):
   - You'll see extensive debug logging
   - Watch for `[UpsellBanner]` and `[detectUpsellOpportunity]` messages

## Test Scenarios

### Scenario 1: Non-Subscription Product
**Expected**: No upsell banner

1. Add regular product (not subscription) to cart
2. Go to checkout
3. **Console should show**:
   ```
   [detectUpsellOpportunity] Checking line item: [Product Name]
   [detectUpsellOpportunity] No selling plan found
   [UpsellBanner] Lines: 1
   [UpsellBanner] Detected upsells: 0
   [UpsellBanner] No upsells detected, not rendering
   ```

### Scenario 2: Quarterly Subscription (SHOULD SHOW UPSELL)
**Expected**: Upsell banner with savings

1. Add Premium Glass with **Quarterly subscription** to cart
2. Go to checkout
3. **Console should show**:
   ```
   [detectUpsellOpportunity] Checking line item: Premium Glass
   [detectUpsellOpportunity] Current frequency: quarterly
   [detectUpsellOpportunity] Current price (cents): [some number > 0]
   [detectUpsellOpportunity] Upgrade estimate: { upgradePrice: X, savingsAmount: Y, savingsPercentage: Z }
   [UpsellBanner] Detected upsells: 1
   [UpsellBanner] First upsell: { currentProduct: {...}, savingsAmount: Y, ... }
   [UpsellBanner] Rendering with best upsell: {...}
   ```

4. **Banner should display**:
   - ✅ Heading: "💡 Save More with Annual Subscription"
   - ✅ Message: "Upgrade your Quarterly subscription to Annual and save $X/year (Y% savings)"
   - ✅ Product name: "You're currently subscribed to: Premium Glass"
   - ✅ Product image (if available from Shopify)
   - ✅ Current price: "Current: $XX.XX"
   - ✅ Upgrade price: "Upgrade: $YY.YY"

### Scenario 3: Monthly Subscription
**Expected**: Upsell banner with higher savings (18% vs quarterly's 12%)

1. Add product with **Monthly subscription**
2. Follow same steps as Scenario 2
3. Should show similar banner but with different savings amount

### Scenario 4: Annual Subscription
**Expected**: No upsell banner

1. Add product with **Annual subscription** (already best tier)
2. **Console should show**:
   ```
   [detectUpsellOpportunity] Current frequency: annual
   [detectUpsellOpportunity] Not upsellable frequency: annual
   [UpsellBanner] No upsells detected, not rendering
   ```

## Debugging Issues

### Issue: Banner Not Visible

**Check Console For**:

1. **"No selling plan found"**
   - Problem: Product isn't a subscription
   - Solution: Make sure you selected a subscription frequency

2. **"Not upsellable frequency: annual"**
   - Not an issue: Annual is already best tier
   - Try with monthly or quarterly

3. **"Invalid price, cannot calculate savings"**
   - Problem: `getCurrentPrice()` returning 0
   - Debug: Add `console.log(lineItem.cost, lineItem.price)` to see structure
   - Shopify might be using different property names

4. **"Current price (cents): 0"**
   - Problem: Price extraction failing
   - Check what properties exist on lineItem:
     ```javascript
     console.log(JSON.stringify(lineItem, null, 2));
     ```

### Issue: No Product Image

**Check**:
1. Console log in `detectUpsellOpportunity`: Does `lineItem.merchandise?.image?.url` exist?
2. Try: `console.log(lineItem.merchandise, lineItem.image)`
3. Shopify might store image at different path

**If image property is undefined**, update `upsellDetector.js`:
```javascript
image: lineItem.merchandise?.image?.src || 
       lineItem.image?.src || 
       lineItem.variant?.image?.url ||
       null
```

### Issue: Prices Show $0.00

**Check `getCurrentPrice()` function**:
1. Console log the line item structure
2. Look for these properties:
   - `lineItem.cost.totalAmount.amount`
   - `lineItem.price.amount`
   - `lineItem.cost.amountPerQuantity.amount`
   - `lineItem.variant.price.amount`

**If different structure**, update in `upsellDetector.js`:
```javascript
function getCurrentPrice(lineItem) {
  // Try multiple property paths
  const amount = 
    lineItem.cost?.totalAmount?.amount ||
    lineItem.cost?.amountPerQuantity?.amount ||
    lineItem.price?.amount ||
    lineItem.variant?.price?.amount ||
    '0';
    
  return Math.round(parseFloat(amount) * 100);
}
```

### Issue: No Savings Message

**Check**:
1. `estimateUpgrade()` logs - did it calculate?
2. Is `savingsAmount > 0`?
3. Check if `currentPrice` is valid number

## Expected Console Output (Success)

When working correctly, you should see this flow:

```
[detectUpsellOpportunity] Checking line item: Premium Glass
[detectUpsellOpportunity] Current frequency: quarterly
[detectUpsellOpportunity] Current price (cents): 2500
[detectUpsellOpportunity] Upgrade estimate: {
  upgradePrice: 2200,
  savingsAmount: 1200,
  savingsPercentage: 12
}
[UpsellBanner] Lines: 1
[UpsellBanner] Detected upsells: 1
[UpsellBanner] First upsell: {
  currentProduct: {
    id: "gid://shopify/...",
    title: "Premium Glass",
    image: "https://cdn.shopify.com/.../glass.jpg",
    price: 2500,
    quantity: 1
  },
  savingsAmount: 1200,
  savingsPercentage: 12,
  upgradePrice: 2200,
  upgradeFrequency: "annual"
}
[UpsellBanner] Rendering with best upsell: {...}
```

## What to Report Back

Please provide:

1. **Which scenario you tested**
2. **What you saw** (banner visible? image? prices?)
3. **Console logs** (copy/paste the debug output)
4. **Screenshots** (if possible)

Example report:
```
TESTED: Scenario 2 (Quarterly subscription)
RESULT: ❌ Banner not visible
CONSOLE: 
  [detectUpsellOpportunity] Current price (cents): 0
  [detectUpsellOpportunity] Invalid price, cannot calculate savings

ISSUE: Price extraction failing
```

This will help me identify the exact issue and fix it quickly!
