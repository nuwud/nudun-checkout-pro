# 🔍 Quick Diagnostic: Why Extension Isn't Showing

## Current Status ✅
- ✅ Dev server running
- ✅ Extension built successfully: `nudun-messaging-engine │ Build successful`
- ✅ No TypeScript errors
- ✅ API version correct: `2025-10`
- ✅ Target correct: `purchase.checkout.block.render`

## Most Likely Issue: Extension Not Placed 🎯

**The #1 reason extensions don't show: They're not placed in the checkout editor.**

Shopify checkout extensions **DO NOT** auto-inject. You **MUST** manually place them.

## Quick Fix (5 minutes)

### Step 1: Open Checkout Editor
**URL**: https://admin.shopify.com/store/nudun-dev-store/settings/checkout

1. Click **"Customize"** button in the checkout section
2. This opens the checkout editor

### Step 2: Look for Your Extension
In the **left sidebar**, find:
- **App blocks** section
- Look for: **"NUDUN Messaging Engine"** or **"nudun-messaging-engine"**

### Step 3: Drag and Drop
1. **Drag** the extension from sidebar
2. **Drop** it into the checkout layout
3. Recommended spot: **Between Order Summary items** or **Above payment section**

### Step 4: Save
1. Click **Save** (top-right)
2. Hard refresh your checkout page (Ctrl+Shift+R)

## How to Verify It's Placed

### In Checkout Editor:
```
Left Sidebar → App blocks
  ✅ "NUDUN Messaging Engine" (NOT grayed out)
  
Center Preview
  ✅ You can see the extension block
  ✅ Might say "Loading..." or show placeholder
```

### In Live Checkout (with Quarterly subscription):
```
Browser Console (F12):
  ✅ [detectUpsellOpportunity] Checking line item: Premium Glass
  ✅ [UpsellBanner] Detected upsells: 1
  
Visible Banner:
  ✅ Heading: "💡 Save More with Annual Subscription"
  ✅ Product image
  ✅ Prices and savings
```

## Other Possible Issues (Less Likely)

### Issue: Extension Grayed Out in Sidebar
**Meaning**: Already placed, but hidden
**Fix**: 
1. Look through the checkout preview
2. Check collapsed sections
3. Look in Order Summary (right side)

### Issue: No Console Logs at All
**Meaning**: Extension not loading
**Fix**:
1. Make sure you **saved** in checkout editor
2. **Hard refresh** checkout page (Ctrl+Shift+R)
3. Check Network tab for extension JS file loading

### Issue: Console Shows Errors
**Meaning**: Extension loaded but crashing
**What to check**:
1. Does `shopify` global exist? (should be auto-provided)
2. Any red errors in console? (screenshot and send)

## Test Checklist

After placing extension, verify:

- [ ] Console shows: `[detectUpsellOpportunity] Checking line item:`
- [ ] Console shows: `[detectUpsellOpportunity] Current frequency: quarterly`
- [ ] Console shows: `[UpsellBanner] Detected upsells: 1`
- [ ] Banner visible in checkout
- [ ] Product image shows
- [ ] Prices display correctly
- [ ] Savings message shows

## Screenshots Needed

If still not working, screenshot:
1. **Checkout editor** - Left sidebar showing "App blocks"
2. **Checkout preview** - Center area showing layout
3. **Browser console** - F12 → Console tab with any logs
4. **Checkout page** - The actual checkout where banner should show

## Expected Result (SUCCESS)

**Console Output**:
```javascript
[detectUpsellOpportunity] Checking line item: Premium Glass
[detectUpsellOpportunity] Current frequency: quarterly
[detectUpsellOpportunity] Current price (cents): 14999
[detectUpsellOpportunity] Upgrade estimate: { upgradePrice: 13199, savingsAmount: 7196, savingsPercentage: 12 }
[UpsellBanner] Lines: 1
[UpsellBanner] Detected upsells: 1
[UpsellBanner] Rendering with best upsell: {...}
```

**Visual Banner**:
```
┌──────────────────────────────────────┐
│ 💡 Save More with Annual Subscription│
│                                      │
│ [IMAGE: Premium Glass]               │
│                                      │
│ Upgrade your Quarterly subscription │
│ to Annual and save $71.96/year      │
│ (12% savings)                        │
│                                      │
│ Current: $149.99 → Upgrade: $131.99 │
│                                      │
│ You're currently subscribed to:      │
│ Premium Glass                        │
└──────────────────────────────────────┘
```

---

## TL;DR

1. Go to: **Settings → Checkout → Customize**
2. Find: **"NUDUN Messaging Engine"** in left sidebar
3. Drag it into the checkout layout
4. Save
5. Refresh checkout page
6. Check console for debug logs

**That's it!** The extension is built and ready - it just needs to be placed in the editor. 🚀
