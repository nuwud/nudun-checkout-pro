# 🚨 CRITICAL: Extension Placement in Checkout Editor

## Problem
Your extension is **building successfully** but **NOT visible in checkout** because:
- Extensions don't auto-inject into checkout
- They must be **manually placed** in the checkout editor
- This is a one-time setup step

## Solution: Place Extension in Checkout Editor

### Step 1: Open Checkout Editor
1. Go to your Shopify admin: https://admin.shopify.com/store/nudun-dev-store
2. Navigate to: **Settings** → **Checkout**
3. Scroll to: **Checkout and accounts** section
4. Click: **Customize** button (opens checkout editor)

### Step 2: Add Extension Block
1. In the left sidebar, look for: **App blocks** section
2. Find your extension: **"NUDUN Messaging Engine"** or **"nudun-messaging-engine"**
3. **Drag and drop** the extension block into the checkout layout
4. Recommended placement: 
   - **Order summary** section (right side)
   - OR **Between shipping and payment** (left side)

### Step 3: Save Changes
1. Click **Save** in the top-right corner
2. The extension is now active in checkout

### Step 4: Test in Checkout
1. Add Premium Glass with **Quarterly subscription** to cart
2. Go to checkout
3. You should now see:
   - ✅ Console logs: `[UpsellBanner] Detected upsells: 1`
   - ✅ Upsell banner with product image
   - ✅ Savings message: "Upgrade and save..."

## Troubleshooting

### Extension Not in Sidebar?
**Check these:**
1. Dev server running? (`npm run dev`)
2. Extension built successfully? (check terminal for "Build successful")
3. App installed in store? (go to Apps → NUDUN Checkout Pro)
4. Correct store selected? (nudun-dev-store)

### Extension Grayed Out?
- Means it's already placed in the layout
- Look for it in the checkout preview (might be in a collapsed section)

### Still Not Working?
1. **Refresh the checkout editor page**
2. **Re-save** the checkout configuration
3. **Hard refresh** the checkout page (Ctrl+Shift+R)
4. **Check browser console** for our debug logs

## Visual Guide

```
┌─────────────────────────────────────┐
│ Checkout Editor                     │
├─────────────────────────────────────┤
│ Left Sidebar:                       │
│   📦 Sections                       │
│   🧩 App blocks ← LOOK HERE         │
│      └─ 📱 NUDUN Messaging Engine  │
│         ↓ Drag me →                │
│                                     │
│ Center: Checkout Preview            │
│   ┌───────────────────────┐        │
│   │ Contact               │        │
│   │ Shipping              │        │
│   │ [DROP EXTENSION HERE] │ ← HERE │
│   │ Payment               │        │
│   └───────────────────────┘        │
│                                     │
│ Right: Extension Settings           │
└─────────────────────────────────────┘
```

## What You Should See After Placement

### In Checkout Editor:
- Extension block visible in layout
- Can configure settings (if any)
- Preview shows extension content

### In Live Checkout (with Quarterly subscription):
```
┌─────────────────────────────────────┐
│ 💡 Save More with Annual            │ ← BANNER
│ Subscription                        │
├─────────────────────────────────────┤
│ [PRODUCT IMAGE]                     │ ← IMAGE
│                                     │
│ Upgrade your Quarterly subscription│ ← MESSAGE
│ to Annual and save $18.00/year     │
│ (12% savings)                       │
│                                     │
│ Current: $37.25 → Upgrade: $36.67  │ ← PRICES
│                                     │
│ You're currently subscribed to:     │ ← CONTEXT
│ Premium Glass                       │
└─────────────────────────────────────┘
```

### In Browser Console:
```javascript
[detectUpsellOpportunity] Checking line item: Premium Glass
[detectUpsellOpportunity] Current frequency: quarterly
[detectUpsellOpportunity] Current price (cents): 14999
[detectUpsellOpportunity] Upgrade estimate: {
  upgradePrice: 13199,
  savingsAmount: 7196,
  savingsPercentage: 12
}
[UpsellBanner] Lines: 1
[UpsellBanner] Detected upsells: 1
[UpsellBanner] First upsell: {...}
[UpsellBanner] Rendering with best upsell: {...}
```

## Important Notes

1. **Branch doesn't matter** - Extensions load from dev server, not Git branch
2. **One-time setup** - Once placed, extension stays in checkout
3. **Dev vs Production** - Placement is per-environment (dev store only for now)
4. **Multiple extensions** - You can have multiple blocks from same app

## Next Steps After Placement

Once you see the banner working:
1. ✅ Test different subscription frequencies
2. ✅ Verify prices calculate correctly
3. ✅ Check product images load
4. ✅ Test custom message styles
5. ✅ Remove debug console.log statements
6. ✅ Add analytics tracking

---

**Need help?** Take a screenshot of:
1. Checkout editor sidebar (showing available app blocks)
2. Checkout layout (showing placed blocks)
3. Browser console (F12 → Console tab)
