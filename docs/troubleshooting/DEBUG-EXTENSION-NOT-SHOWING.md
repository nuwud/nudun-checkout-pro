# Extension Not Showing - Debug Checklist

## Current Extension Code ✅
Your code looks correct and should work.

## Step-by-Step Debugging

### 1. Is Dev Server Running?

**Check your terminal**. You should see:
```
nudun-messaging-engine │ Build successful
✅ Ready, watching for changes in your app
```

**If NOT running**, start it:
```bash
cd /c/Users/Nuwud/Projects/nudun-checkout-pro/nudun-checkout-pro
npm run dev
```
Select: **Nudun Dev Store**

---

### 2. Is Extension Added to Checkout Layout?

**This is the #1 reason extensions don't show!**

**Go to Checkout Editor**:
1. Visit: https://admin.shopify.com/store/nudun-dev-store/settings/checkout
2. Click: **"Customize"** button
3. Look at left sidebar under "App blocks"
4. Find: **"nudun-messaging-engine"**

**Two scenarios**:

#### Scenario A: Extension is in sidebar but NOT in layout
- The extension name appears in sidebar
- But it's NOT visible in the preview
- **Solution**: **DRAG** it from sidebar into the checkout (e.g., drop it under "Contact")

#### Scenario B: Extension is in layout already
- You can see it highlighted in the preview when you click it
- But still not showing
- **Solution**: Continue to step 3

---

### 3. Clear Browser Cache

The checkout editor preview can cache aggressively:

**Method 1: Hard Refresh**
- In checkout editor, press: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

**Method 2: Incognito/Private Window**
- Open checkout editor in incognito mode
- Add extension and test

**Method 3: Clear Cache**
- Press F12 → Go to "Application" tab
- Click "Clear storage" → "Clear site data"
- Reload page

---

### 4. Check Browser Console for Errors

**In the checkout editor**:
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for red errors mentioning:
   - "nudun-messaging-engine"
   - "Banner"
   - "createComponent"

**Common errors**:
- `Cannot read property 'appendChild' of undefined` → Banner component failed
- `createComponent is not a function` → Wrong API version

**If you see errors, copy and paste them**

---

### 5. Test in REAL Checkout (Not Just Editor)

The editor preview can be buggy. Test the actual checkout:

1. **Go to storefront**: https://nudun-dev-store.myshopify.com
2. **Add product**: Click any product → "Add to Cart"
3. **Go to checkout**: Click "Checkout" button
4. **Look for extension**: Should see red banner

**Important**: Make sure you saved in the checkout editor first!

---

### 6. Check Extension Target Compatibility

Your config uses: `purchase.checkout.block.render`

This requires **merchant to place it manually**. Try changing to auto-placement:

Edit `extensions/nudun-messaging-engine/shopify.extension.toml`:

```toml
[[extensions.targeting]]
module = "./src/Checkout.jsx"
# Change from: target = "purchase.checkout.block.render"
# To one of these:
target = "purchase.checkout.shipping-option-list.render-after"
# OR
target = "purchase.checkout.delivery-address.render-after"
# OR  
target = "purchase.checkout.payment-method-list.render-after"
```

Then restart dev server.

---

### 7. Try Ultra-Simple Code

Replace extension code with the absolute minimum:

```jsx
export default (root) => {
  const text = root.createText('TEST EXTENSION WORKS');
  root.appendChild(text);
};
```

If this shows, then the Banner component is the issue.

---

## Quick Diagnostic Questions

Answer these to help me diagnose:

1. **Is your dev server running right now?** (Check terminal)
2. **In Checkout Editor, do you see "nudun-messaging-engine" in the left sidebar?**
3. **Have you dragged it into the checkout layout?** (Not just listed, but actually placed)
4. **Did you click "Save" after placing it?**
5. **Are you testing in the editor preview or real checkout?**
6. **Do you see ANY errors in browser console (F12)?**

---

## Most Likely Issue

Based on 95% of cases: **Extension is not dragged into checkout layout.**

**To verify**: 
- Go to checkout editor
- Click on "nudun-messaging-engine" in sidebar
- If nothing highlights in the preview, it's not placed yet
- **Drag it into the checkout** and **Save**

---

## Screenshot Request

Can you take a screenshot showing:
1. The checkout editor with left sidebar visible
2. Whether "nudun-messaging-engine" is in the sidebar
3. The preview area

This will help me see exactly what's happening!
