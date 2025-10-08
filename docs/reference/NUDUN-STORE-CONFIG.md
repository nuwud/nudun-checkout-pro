# NUDUN Checkout Pro - Store Configuration

## Store and App Information

**Store Name**: Nudun Dev Store  
**Store URL**: https://nudun-dev-store.myshopify.com  
**Admin URL**: https://admin.shopify.com/store/nudun-dev-store  

**App Name**: NUDUN Checkout Pro  
**App ID**: `gid://shopify/App/286622121985`  
**App Preview URL**: https://scsi-domain-honest-democratic.trycloudflare.com/  

**Organization**: My Store  

**API Version**: 2025-10  
**Checkout Extensibility**: ✅ Enabled ("Checkout and Customer Accounts Extensibility" badge visible)  

## Required App Scopes

- View personal data  
- Store owner  
- View and edit store data  
- Products  

## Development Commands

```bash
# Navigate to project directory
cd /c/Users/Nuwud/Projects/nudun-checkout-pro/nudun-checkout-pro

# Start development server
npm run dev

# Alternative command
shopify app dev --store nudun-dev-store.myshopify.com
```

## Extension Configuration

### File: `extensions/nudun-messaging-engine/shopify.extension.toml`

```toml
api_version = "2025-10"

[[extensions]]
name = "nudun-messaging-engine"
handle = "nudun-messaging-engine"
type = "ui_extension"
uid = "372a897e-50c0-8363-1187-45442ee1387e0aa03de4"

[[extensions.targeting]]
module = "./src/Checkout.jsx"
target = "purchase.checkout.block.render"

[extensions.capabilities]
api_access = true
```

### File: `extensions/nudun-messaging-engine/src/Checkout.jsx`

```jsx
// Shopify Checkout UI Extension for 2025-10 API
export default (root) => {
  // Create a Banner component
  const banner = root.createComponent('Banner', { 
    status: 'critical',
    title: 'NUDUN Extension' 
  });
  
  // Add text inside the banner
  const text = root.createText('🚨 NUDUN EXTENSION WORKING! 🚨');
  banner.appendChild(text);
  
  // Add banner to root
  root.appendChild(banner);
};
```

## Testing Your Extension

### Method 1: Real Checkout Test

1. **Go to storefront**: https://nudun-dev-store.myshopify.com
2. **Add product to cart**: Click any product → "Add to Cart"
3. **Go to checkout**: Click "Checkout" button
4. **Look for extension**: You should see a red banner with "🚨 NUDUN EXTENSION WORKING! 🚨"

### Method 2: Checkout Editor

1. **Open Checkout Settings**: https://admin.shopify.com/store/nudun-dev-store/settings/checkout
2. **Click "Customize"** button
3. **Find your extension**: Look for "nudun-messaging-engine" in left sidebar under "App blocks"
4. **Add to checkout**: Drag the extension into your desired position
5. **Save changes**: Click "Save" in top-right
6. **Preview**: The preview should show your extension

### Method 3: Extension Console

Open the dev console URL (from your running dev server):
```
https://scsi-domain-honest-democratic.trycloudflare.com/extensions/dev-console
```

Or press `p` in your terminal when dev server is running.

## Common Issues & Solutions

### Issue: "No extensions found"

**Causes**:
- Dev server not running
- Extension not deployed to store
- Extension has JavaScript error

**Solution**:
1. Make sure `npm run dev` is running
2. Look for "Build successful" message
3. Check browser console for errors
4. Add extension via Checkout Editor first

### Issue: Extension not visible in checkout

**Causes**:
- Extension not added to checkout layout
- Wrong extension target
- Store doesn't have extensibility enabled

**Solution**:
1. Go to Checkout Editor (Settings → Checkout → Customize)
2. Drag "nudun-messaging-engine" into checkout
3. Save changes
4. Verify store has "Checkout and Customer Accounts Extensibility" badge

### Issue: "TypeError: (0, a.default) is not a function"

**Cause**: Wrong export format for 2025-10 API

**Solution**: Use the vanilla JavaScript API format:
```jsx
export default (root) => {
  // Your extension code
};
```

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Select store**: Choose "Nudun Dev Store"
3. **Wait for build**: Look for "Build successful"
4. **Add to checkout**: Go to Checkout Editor and add extension
5. **Test**: Visit storefront and go through checkout
6. **Iterate**: Make changes, extension auto-rebuilds

## Verification Checklist

Before testing:

- [ ] Dev server running (`npm run dev`)
- [ ] Store selected (Nudun Dev Store)
- [ ] Extension built successfully
- [ ] Store has "Checkout Extensibility" enabled
- [ ] Extension added in Checkout Editor
- [ ] Changes saved in Checkout Editor

## URLs Reference

**Storefront**: https://nudun-dev-store.myshopify.com  
**Admin**: https://admin.shopify.com/store/nudun-dev-store  
**Checkout Settings**: https://admin.shopify.com/store/nudun-dev-store/settings/checkout  
**App Dashboard**: https://admin.shopify.com/store/nudun-dev-store/apps/nudun-checkout-pro  
**Partner Dashboard**: https://partners.shopify.com/161493695  

## Next Steps

1. ✅ Store configured with extensibility
2. ✅ Extension code fixed
3. ⏳ **Run `npm run dev` and select "Nudun Dev Store"**
4. ⏳ **Add extension via Checkout Editor**
5. ⏳ **Test in real checkout**

---

**Last Updated**: October 7, 2025  
**Status**: Ready to test - extension code fixed and store properly configured
