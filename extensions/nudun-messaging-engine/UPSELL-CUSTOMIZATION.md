# Upsell Customization Guide

## Quick Start: Customize Upsell Messages

### Change Message Style (1 Line!)

Open `src/config/merchantSettings.js` and change:

```javascript
export const UPSELL_TEMPLATE_STYLE = 'default'; // Change this!
```

**Available Styles:**
- `'default'` - Standard marketing: "💡 Save More with Annual Subscription"
- `'legal'` - Conservative: "Annual Subscription Available"
- `'minimal'` - Brief: "Switch to Annual"
- `'enthusiastic'` - High-energy: "🎉 Huge Savings with Annual Plan!"

### Control What Displays

Edit `UPSELL_DISPLAY_SETTINGS` in `merchantSettings.js`:

```javascript
export const UPSELL_DISPLAY_SETTINGS = {
  showProductImage: true,        // Show product thumbnail
  showCurrentPrice: true,         // Show current subscription price
  showUpgradePrice: true,         // Show upgrade subscription price  
  showSavingsAmount: true,        // Show savings dollar amount
  showSavingsPercentage: true,    // Show savings percentage
  showProductName: true,          // Show product title
  imageSize: 'small',             // 'small', 'medium', 'large'
  imagePosition: 'left'           // 'left', 'right', 'top'
};
```

**Examples:**

**Minimal Display (No Image):**
```javascript
showProductImage: false,
showCurrentPrice: false,
showUpgradePrice: false
```

**Price Comparison Focus:**
```javascript
showCurrentPrice: true,
showUpgradePrice: true,
imagePosition: 'top'
```

**Image-Heavy Display:**
```javascript
showProductImage: true,
imageSize: 'large',
imagePosition: 'top'
```

---

## Advanced: Custom Templates

### Full Message Control

Uncomment and edit `CUSTOM_UPSELL_TEMPLATES`:

```javascript
export const CUSTOM_UPSELL_TEMPLATES = {
  heading: '💰 Upgrade to {upgradeFrequency} & Save',
  message: 'Switch {productName} from {currentFrequency} to {upgradeFrequency} and save {savingsAmount} annually',
  context: 'Current: {currentFrequency} @ {currentPrice}',
  buttonText: 'Upgrade Now',
  compact: '{savingsAmount}/year with {upgradeFrequency}'
};
```

### Template Variables

Use these in your custom templates:

- `{productName}` - Product title (e.g., "Premium Glass")
- `{currentFrequency}` - Current frequency (e.g., "Quarterly")
- `{upgradeFrequency}` - Upgrade frequency (e.g., "Annual")
- `{savingsAmount}` - Savings with currency (e.g., "$45.00")
- `{savingsPercentage}` - Savings percentage (e.g., "15")
- `{currentPrice}` - Current price (e.g., "$25.00")
- `{upgradePrice}` - Upgrade price (e.g., "$22.50")

### Example: Legal Compliance

Remove all "free" and enthusiastic language:

```javascript
export const CUSTOM_UPSELL_TEMPLATES = {
  heading: 'Annual Plan Available',
  message: 'Annual delivery reduces cost by {savingsAmount} per year compared to {currentFrequency}',
  context: 'Product: {productName}',
  buttonText: 'Switch to Annual',
  compact: 'Annual: {savingsAmount} annual savings'
};
```

### Example: Enthusiastic Marketing

Maximize excitement:

```javascript
export const CUSTOM_UPSELL_TEMPLATES = {
  heading: '🎉 MASSIVE {savingsPercentage}% Savings!',
  message: 'Switch {productName} to {upgradeFrequency} and pocket an extra {savingsAmount} EVERY YEAR! 🤑',
  context: 'Currently wasting money on {currentFrequency} - upgrade NOW!',
  buttonText: '💰 YES! Save {savingsPercentage}%',
  compact: '🚀 {savingsAmount}/year savings!'
};
```

---

## Template Style Comparison

### Default Style
- **Heading:** 💡 Save More with Annual Subscription
- **Message:** Upgrade your Quarterly subscription to Annual and save $45.00/year (15% savings)
- **Context:** You're currently subscribed to: Premium Glass

### Legal Style  
- **Heading:** Annual Subscription Available
- **Message:** Switch from Quarterly to Annual delivery and reduce annual cost by $45.00 (15%)
- **Context:** Current subscription: Premium Glass

### Minimal Style
- **Heading:** Switch to Annual
- **Message:** Save $45.00/year with Annual delivery
- **Context:** Premium Glass

### Enthusiastic Style
- **Heading:** 🎉 Huge Savings with Annual Plan!
- **Message:** Level up to Annual and pocket $45.00 every year! That's 15% more savings on Premium Glass
- **Context:** Currently on Quarterly - upgrade now!

---

## Workflow

### 1. Quick Style Change (30 seconds)
```javascript
// In merchantSettings.js
export const UPSELL_TEMPLATE_STYLE = 'legal'; // Just change this!
```

### 2. Rebuild & Test
```bash
npm run dev
```

### 3. Verify in Checkout
- Add subscription product to cart
- Navigate to checkout
- See updated upsell message

### 4. Deploy
```bash
npm run build
npm run deploy
```

---

## Display Settings Examples

### Scenario: Show Image with Price Comparison

```javascript
export const UPSELL_DISPLAY_SETTINGS = {
  showProductImage: true,
  showCurrentPrice: true,
  showUpgradePrice: true,
  showSavingsAmount: true,
  showSavingsPercentage: true,
  showProductName: true,
  imageSize: 'medium',
  imagePosition: 'left'  // Image on left, text on right
};
```

**Result:**
```
[Product Image]  💡 Save More with Annual Subscription
                 Upgrade your Quarterly subscription to Annual 
                 and save $45.00/year (15% savings)
                 
                 Current: $25.00 → Upgrade: $22.50
                 
                 You're currently subscribed to: Premium Glass
```

### Scenario: Minimal Text-Only

```javascript
export const UPSELL_DISPLAY_SETTINGS = {
  showProductImage: false,
  showCurrentPrice: false,
  showUpgradePrice: false,
  showSavingsAmount: true,
  showSavingsPercentage: false,
  showProductName: false,
  imageSize: 'small',
  imagePosition: 'left'
};
```

**Result:**
```
💡 Save More with Annual Subscription
Upgrade your Quarterly subscription to Annual and save $45.00/year
```

### Scenario: Image-Heavy Display

```javascript
export const UPSELL_DISPLAY_SETTINGS = {
  showProductImage: true,
  showCurrentPrice: true,
  showUpgradePrice: true,
  showSavingsAmount: true,
  showSavingsPercentage: true,
  showProductName: true,
  imageSize: 'large',
  imagePosition: 'top'  // Big image on top
};
```

**Result:**
```
        [Large Product Image]
        
💡 Save More with Annual Subscription
Upgrade your Quarterly subscription to Annual and save $45.00/year (15% savings)

Current: $25.00 → Upgrade: $22.50

You're currently subscribed to: Premium Glass
```

---

## Testing Your Customizations

### 1. Test with Premium Glass Product
URL: https://nudun-dev-store.myshopify.com/products/premium-glass

**Setup:**
- Product must have both Quarterly and Annual selling plans
- Add to cart with Quarterly plan selected
- Navigate to checkout
- Should see upsell for Annual upgrade

### 2. Verify Template Variables
Check that all variables interpolate correctly:
- Product name shows correctly
- Prices formatted with currency symbol
- Savings calculation accurate
- Frequency labels correct (Quarterly → Annual)

### 3. Test Display Settings
Try different combinations:
- Toggle image on/off
- Change image position
- Toggle price display
- Test on mobile (image position matters!)

---

## Common Customizations

### Remove "Free" Language (Legal Compliance)
```javascript
export const UPSELL_TEMPLATE_STYLE = 'legal';
```

### Hide All Prices (Focus on Percentage)
```javascript
export const UPSELL_DISPLAY_SETTINGS = {
  showCurrentPrice: false,
  showUpgradePrice: false,
  showSavingsAmount: false,  // Hide dollar amount
  showSavingsPercentage: true // Show % only
};
```

### Minimal Mobile-Friendly Display
```javascript
export const UPSELL_TEMPLATE_STYLE = 'minimal';
export const UPSELL_DISPLAY_SETTINGS = {
  showProductImage: false,     // No image on mobile
  showCurrentPrice: false,
  showUpgradePrice: false,
  imagePosition: 'top'         // Better for narrow screens
};
```

---

## Future: Admin UI

**Coming Soon:** All these settings will be editable in the Shopify admin dashboard!

For now, edit `merchantSettings.js` and rebuild.

---

## Support

**Issues?**
1. Check template variable spelling (case-sensitive!)
2. Verify display settings don't conflict (can't show prices if both are false)
3. Ensure product has subscription selling plans
4. Test in dev store before production

**Questions?**
- See main `CUSTOMIZATION.md` for threshold message customization
- Check `upsellTemplates.js` for all available template styles
- Review `merchantSettings.js` for full configuration options
