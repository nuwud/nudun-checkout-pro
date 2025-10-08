# Checkout Extension Setup Guide

## ✅ Current Status (October 7, 2025)

- **Extension Code**: Fixed and using 2025-10 API ✅
- **Dev Server**: Running ✅
- **Next Step**: Configure correct dev store with checkout extensibility

## 🎯 The Critical Requirement

**Checkout extensions ONLY work on dev stores with "Checkout Extensibility" enabled.**

### How to Check if Your Store Has Extensibility:

#### Method 1: Admin Check (Fastest)
1. Go to store admin: `https://admin.shopify.com/store/YOUR-STORE-NAME`
2. Look at **bottom-left corner**
3. You should see: **"Checkout Extensibility preview"** badge

#### Method 2: Partner Dashboard
1. Go to: https://partners.shopify.com/161493695/stores
2. Look for stores with **"Checkout extensibility"** label

## 🏪 Your Available Stores

Based on your dev server output, you have:

1. **FitScrubsExp** (fitscrubsexp.myshopify.com)
2. **FitScrubsExp2** (fitscrubsexp2.myshopify.com)
3. **Nudun Dev Store** (nudun-dev-store.myshopify.com) ⭐ **NEW - Likely has extensibility**

## 🔧 Configuration Steps

### If You Have a Store with Extensibility:

1. **Select the store** in your running terminal (should still be waiting)
2. **Install the app** when prompted
3. **View checkout** - your extension should appear

### If NO Store Has Extensibility:

Run this command to create a new store:

```bash
shopify app dev --reset
```

When prompted:
- **Organization**: Select "My Store" or your partner org
- **Create new store**: YES ✅
- **Enable checkout extensibility**: YES ✅

## 🐛 Common Issues & Solutions

### Issue: "Can only be installed on stores that are part of the same organization"

**Solution**: 
1. Check which organization your app belongs to
2. Make sure the dev store is in the SAME organization
3. Create a new store in the correct organization if needed

### Issue: Extension not showing in checkout

**Causes**:
- ❌ Store doesn't have extensibility enabled
- ❌ Extension not installed/activated
- ❌ Wrong extension target in `shopify.extension.toml`

**Solution**:
1. Verify extensibility badge in admin
2. Check extension console: `https://YOUR-TUNNEL-URL/extensions/dev-console`
3. Verify `shopify.extension.toml` has `target = "purchase.checkout.block.render"`

### Issue: "TypeError: (0, a.default) is not a function"

**Cause**: Wrong export format for 2025-10 API

**Solution**: Use vanilla JavaScript API (already fixed):
```jsx
export default (root) => {
  // Your extension code
};
```

## 📋 Quick Checklist

Before running checkout extensions:

- [ ] Dev store has "Checkout Extensibility preview" badge
- [ ] App and store are in same organization
- [ ] `npm run dev` is running
- [ ] Extension code uses correct 2025-10 API syntax
- [ ] Extension target is `purchase.checkout.block.render`

## 🚀 Testing Your Extension

Once configured:

1. **Dev server running**: `npm run dev`
2. **Open checkout**: Go to your store and add a product to cart
3. **Navigate to checkout**: You should see your extension banner
4. **Extension console**: Check `YOUR-TUNNEL/extensions/dev-console` for status

## 📚 Resources

- [Checkout UI Extensions Docs](https://shopify.dev/docs/api/checkout-ui-extensions)
- [Extension Targets](https://shopify.dev/docs/api/checkout-ui-extensions/extension-targets-overview)
- [API Reference 2025-10](https://shopify.dev/docs/api/checkout-ui-extensions/2025-10)

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Reset and create new dev store
shopify app dev --reset

# Check extension status
# Open: https://YOUR-TUNNEL/extensions/dev-console

# Build extension
npm run build

# Deploy to production
npm run deploy
```

## 🎯 Current Configuration

- **API Version**: 2025-10
- **Extension Target**: `purchase.checkout.block.render`
- **Extension File**: `extensions/nudun-messaging-engine/src/Checkout.jsx`
- **Config File**: `extensions/nudun-messaging-engine/shopify.extension.toml`

---

**Last Updated**: October 7, 2025
**Status**: Extension code fixed, waiting for store selection with extensibility enabled
