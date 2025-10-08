# 📝 Customizing Dynamic Messaging

**NUDUN Checkout Pro** allows you to customize all threshold messaging to match your brand voice and legal requirements.

## 🎯 Quick Start: Legal Compliance (Remove "Free" Language)

If your store cannot use "free" language due to legal requirements:

### Option 1: Use Legal-Compliant Templates (Recommended)

Edit `src/config/merchantSettings.js`:

```javascript
// Change this line:
export const TEMPLATE_STYLE = 'default';

// To this:
export const TEMPLATE_STYLE = 'legal';
```

**Before** (default):
- "Add $25.00 more for **free shipping**!"
- "🎉 You qualify for **free shipping**!"

**After** (legal):
- "Add $25.00 more to qualify for **complimentary shipping**."
- "🎉 **Complimentary shipping** qualified!"

### Option 2: Conservative Messaging

For minimal marketing language:

```javascript
export const TEMPLATE_STYLE = 'conservative';
```

**Result**:
- "Add $25.00 to reach $50.00 for free shipping."
- "Shipping threshold reached"

---

## 🎨 Advanced: Fully Custom Messages

For complete control, define custom templates in `src/config/merchantSettings.js`:

```javascript
export const CUSTOM_TEMPLATES = {
  unmet: {
    shipping: {
      title: "Shipping Offer",
      message: "Add {amount} more to qualify for no-cost shipping.",
      progressText: "{percentage} toward no-cost shipping"
    },
    gift: {
      title: "Bonus Item",
      message: "Spend {amount} more to receive a bonus item.",
      progressText: "{percentage} toward bonus item"
    }
  },
  met: {
    shipping: {
      title: "✓ Shipping Qualified",
      message: "You qualify for no-cost shipping on this order.",
      progressText: "No-cost shipping applied"
    },
    gift: {
      title: "✓ Bonus Item Qualified",
      message: "You've qualified for a bonus item.",
      progressText: "Bonus item included"
    }
  }
};
```

### Template Variables

Use these placeholders in your messages:

| Variable | Description | Example |
|----------|-------------|---------|
| `{amount}` | Remaining amount to reach threshold | `$25.00` |
| `{threshold}` | Threshold value | `$50.00` |
| `{percentage}` | Progress percentage | `50%` |
| `{discount}` | Discount percentage (if applicable) | `10` |

---

## 🎨 Customizing Display Settings

Edit `src/config/merchantSettings.js`:

```javascript
export const DISPLAY_SETTINGS = {
  // Maximum banners shown at once
  maxVisibleBanners: 2,
  
  // Allow customers to dismiss banners
  allowDismiss: true,
  
  // Remember dismissed banners across page reloads
  persistDismissed: true,
  
  // Show progress bars
  showProgressBar: true,
  
  // Progress bar style: 'gradient' or 'solid'
  progressBarStyle: 'gradient',
  
  // Auto-hide success messages after X milliseconds (0 = never)
  autoHideMetThresholdsDelay: 0,
  
  // Animation: 'fade', 'slide', or 'none'
  animationStyle: 'fade',
};
```

---

## 🎨 Custom Branding (Colors & Icons)

### Custom Colors

```javascript
export const BRANDING_SETTINGS = {
  customColors: {
    // Unmet threshold banner (blue tones)
    unmetBackground: '#e3f2fd',
    unmetText: '#01579b',
    unmetBorder: '#90caf9',
    
    // Met threshold banner (green tones)
    metBackground: '#e8f5e9',
    metText: '#2e7d32',
    metBorder: '#81c784',
    
    // Progress bar
    progressBarColor: '#4caf50',
  },
};
```

### Custom Icons/Emoji

```javascript
export const BRANDING_SETTINGS = {
  customIcons: {
    shipping: '🚚',    // Shipping icon
    gift: '🎁',        // Gift icon
    discount: '💰',    // Discount icon
    success: '🎉',     // Success icon
    progress: '📊',    // Progress icon
  },
};
```

**Or remove emoji entirely:**

```javascript
customIcons: {
  shipping: '',
  gift: '',
  discount: '',
  success: '✓',  // Simple checkmark
  progress: '',
},
```

---

## 📊 A/B Testing

Test different message styles to optimize conversion:

```javascript
export const AB_TESTING = {
  enabled: true,  // Enable A/B testing
  
  variants: [
    {
      name: 'control',
      weight: 50,  // 50% of customers see this
      templateStyle: 'default'
    },
    {
      name: 'legal',
      weight: 50,  // 50% of customers see this
      templateStyle: 'legal'
    }
  ]
};
```

Analytics events will include the variant name so you can measure performance.

---

## 📈 Analytics Tracking

Control what events are tracked:

```javascript
export const ANALYTICS_SETTINGS = {
  trackImpressions: true,          // Track banner views
  trackDismissals: true,           // Track dismissals
  trackThresholdCrossings: true,   // Track when thresholds are met
  eventPrefix: 'nudun_checkout_'   // Event name prefix
};
```

**Events sent:**
- `nudun_checkout_banner_view` - Banner displayed
- `nudun_checkout_banner_dismiss` - Customer dismissed banner
- `nudun_checkout_threshold_met` - Customer reached threshold
- `nudun_checkout_threshold_crossed` - Customer crossed threshold

---

## 🚀 Applying Changes

After editing `src/config/merchantSettings.js`:

1. **Save the file**
2. **Rebuild the extension**:
   ```bash
   npm run dev
   ```
3. **Test in checkout preview**
4. **Deploy**:
   ```bash
   shopify app deploy
   ```

Changes take effect immediately on next build.

---

## 📋 Template Style Reference

### Default Style
✅ **Use for:** Standard e-commerce stores  
⚠️ **Avoid if:** Legal restrictions on "free" claims

- "Add $25.00 more for **free shipping**!"
- "🎉 You qualify for **free shipping**!"

### Legal Style
✅ **Use for:** Stores with legal compliance requirements  
✅ **Use for:** Jurisdictions requiring disclaimers on "free" claims

- "Add $25.00 more to qualify for **complimentary shipping**."
- "🎉 **Complimentary shipping** qualified!"

### Conservative Style
✅ **Use for:** Luxury/premium brands  
✅ **Use for:** Minimal marketing messaging

- "Add $25.00 to reach $50.00 for free shipping."
- "Shipping threshold reached"

---

## 🛟 Support

### Common Issues

**Q: Changes not appearing in checkout?**  
A: Run `npm run dev` to rebuild, then refresh checkout preview.

**Q: Can I test templates before deploying?**  
A: Yes! Use `npm run dev` and test in the dev store checkout preview.

**Q: Can I have different messages for different products?**  
A: Not yet - this is planned for Phase 2B. Currently all products use the same templates.

**Q: Will this work in all languages?**  
A: Yes - add translations to `locales/*.json` files. Templates use the same keys across languages.

### Need Help?

- 📖 [Full Documentation](../docs/)
- 🐛 [Report Issues](https://github.com/nuwud/nudun-checkout-pro/issues)
- 💬 [Shopify Community](https://community.shopify.com/)

---

## 🔮 Coming Soon

**Merchant Admin UI** (Phase 5):
- Edit messages directly in Shopify admin
- Preview changes in real-time
- Save multiple message sets
- Schedule message variations by date/time

Stay tuned! 🚀
