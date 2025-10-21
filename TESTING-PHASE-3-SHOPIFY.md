# 🧪 Testing GlasswareMessage in Your Shopify Dev Store

**Status**: Ready to Test ✅  
**Dev Store**: nudun-dev-store.myshopify.com  
**App ID**: 286617272321 (NUDUN Checkout Pro)  
**Extension**: nudun-messaging-engine  
**Component**: GlasswareMessage (Phase 3)

---

## 📋 Pre-Test Checklist

✅ GlasswareMessage component created (115 lines)  
✅ All 45 tests passing  
✅ Integrated to Checkout.jsx  
✅ Build successful  
✅ Main branch merged  
✅ Dev tunnel starting (`npm run dev`)

---

## 🚀 Step 1: Start Dev Tunnel

### Your dev server is now running!

Terminal shows:
```
> shopify app dev
```

Wait for output showing:
```
✓ Tunnel created: https://xxx.trycloudflare.com
✓ App URL: https://xxx.trycloudflare.com/admin
```

**Expected**: 30-60 seconds to establish tunnel

---

## 📍 Step 2: Open Checkout Editor

1. **Open Shopify Admin**: https://nudun-dev-store.myshopify.com/admin
2. **Navigate to**: Settings → Checkout & Customer Accounts → Extensibility
3. **Find "Nudun Checkout Pro"** - Should show as installed ✅
4. **Click "Edit checkout"** - Opens Checkout Editor (visual builder)

**Expected**: Visual layout editor with sections for:
- Information
- Shipping
- Payment
- Summary

---

## 🎯 Step 3: Place GlasswareMessage Extension

1. **Left Sidebar**: Look for **"Extensions"** section
2. **Find**: "nudun-messaging-engine" with components listed:
   - ✅ BannerQueue
   - ✅ UpsellBanner
   - ✅ InclusionMessage
   - ✅ **GlasswareMessage** ← This one!

3. **Drag & Drop**: Drag **GlasswareMessage** into checkout layout
   - Suggested placement: **Below Information section** (top of checkout)
   - This is the Phase 3 messaging layer

4. **Configure** (if prompted):
   - productHandle: `premium-glass` (default) ✅
   - hideIfNoSubscription: `true` (default) ✅

5. **Click "Done"** to save

**Expected**: Component appears in preview area

---

## 🛒 Step 4: Test Cart Scenarios

### Scenario 1: Annual Subscription Product ✅

**Cart Contents**:
- Annual Coffee Subscription ($99/year)
- Regular Mug ($15)

**Expected Behavior**:
```
✅ Banner appears with:
   Title: "🎉 4 Premium Glasses Included"
   Subtitle: "Complimentary glasses included with your annual subscription"
   Value: "$25.00 USD" (or your configured price)
   Tone: Success (green background)
```

**Test Steps**:
1. Go to dev store homepage
2. Add "Annual Subscription" product to cart
3. Proceed to checkout
4. **GlasswareMessage should render** with 4 glasses
5. Verify styling and text appear correctly

---

### Scenario 2: Quarterly Subscription Product ✅

**Cart Contents**:
- Quarterly Coffee Subscription ($27/quarter)
- Grinder ($45)

**Expected Behavior**:
```
✅ Banner appears with:
   Title: "🎉 1 Premium Glass Included"
   Subtitle: "Complimentary glass included with your quarterly subscription"
   Value: "$6.25 USD" (or 1/4 of annual price)
   Tone: Success (green background)
```

**Test Steps**:
1. Create new test cart with quarterly product
2. Proceed to checkout
3. **GlasswareMessage should render** with 1 glass
4. Check singular "Glass" vs plural "Glasses" logic

---

### Scenario 3: Non-Subscription Products (No Banner) ✅

**Cart Contents**:
- Premium Coffee (1-time) - $18
- Filter Papers ($8)

**Expected Behavior**:
```
✅ No GlasswareMessage banner appears
   (Component returns null because hideIfNoSubscription=true)
```

**Test Steps**:
1. Add only non-subscription products
2. Proceed to checkout
3. **Banner should NOT appear** ✅

---

### Scenario 4: Multiple Subscriptions ✅

**Cart Contents**:
- Annual Coffee Subscription ($99)
- Quarterly Tea Subscription ($27)
- Regular Filter ($5)

**Expected Behavior**:
```
✅ Two banners appear:

   First Banner:
   Title: "🎉 4 Premium Glasses Included"
   Subtitle: "...annual subscription"

   Second Banner:
   Title: "🎉 1 Premium Glass Included"
   Subtitle: "...quarterly subscription"
```

**Test Steps**:
1. Add multiple subscription products
2. Proceed to checkout
3. **Both banners should render** separately
4. Verify they appear in correct order

---

## 📱 Step 5: Mobile Testing

### iPhone Testing
1. **Mobile Preview**: Click preview icon in Checkout Editor → Mobile
2. **Or**: Scan QR code on preview with iPhone
3. **Test**:
   - ✅ Banners render without overflow
   - ✅ Text readable on small screen
   - ✅ Spacing appropriate for mobile
   - ✅ Emoji displays correctly (🎉)

### Android Testing
1. **Same as iPhone** - Use dev store URL on Android device
2. **Test**:
   - ✅ Chrome browser rendering
   - ✅ Samsung Internet rendering (if available)

---

## 🔍 Step 6: Developer Console Checks

**Open Dev Tools** (F12 or Cmd+Option+I):

### Console Tab
✅ No red errors
✅ No yellow warnings about missing dependencies
✅ Subscription detection logging (if enabled)
✅ Price lookup logging (if enabled)

**Look For**:
```javascript
// Should see something like:
[GlasswareMessage] Detected subscription: { type: 'annual', glassCount: 4 }
[GlasswareMessage] Price lookup for premium-glass: { amount: '25.00', currencyCode: 'USD' }
```

### Network Tab
✅ No 404 errors on extension resources
✅ No slow requests (>2s)
✅ GraphQL queries completing quickly
✅ All Polaris web components loading

---

## ♿ Step 7: Accessibility Check

### Keyboard Navigation
1. **Tab through checkout** - Banner should be navigable
2. **Focus visible** - Focus indicator visible on banner elements
3. **Tab order** - Logical order through page

### Screen Reader (if available)
- ✅ Banner heading announced
- ✅ Banner text read clearly
- ✅ No redundant announcements

### Color Contrast
- ✅ Text readable on green background (success tone)
- ✅ Emoji visible and clear
- ✅ No color-only information

---

## 📊 Step 8: Performance Checks

### Render Time
- ✅ Component appears in <100ms
- ✅ No checkout lag when adding to cart
- ✅ Banner animates smoothly

### Bundle Size
- ✅ Extension loads quickly
- ✅ No noticeable delay in checkout experience

---

## 🐛 Troubleshooting

### "Component doesn't appear"
**Possible Causes**:
- [ ] Extension not placed in checkout editor
- [ ] No subscription products in cart
- [ ] `hideIfNoSubscription=true` hiding banner
- [ ] Checkout not refreshed after placing extension

**Fix**:
1. Refresh checkout preview
2. Verify extension appears in sidebar
3. Drag it into layout again
4. Add subscription product to cart

### "Banner shows but text is wrong"
**Possible Causes**:
- [ ] Product title doesn't match subscription detection keywords
- [ ] Price lookup failed (returns null)
- [ ] Emoji encoding issue

**Fix**:
1. Check browser console for errors
2. Verify product has "annual" or "quarterly" in title
3. Try different product

### "Multiple banners overlapping"
**Possible Causes**:
- [ ] Checkout layout too tight
- [ ] Mobile viewport too narrow

**Fix**:
1. Adjust checkout section width (if available)
2. Test on landscape orientation
3. Check spacing in Polaris components

### "Emoji not displaying (shows ▢ or ?)"
**Possible Causes**:
- [ ] Browser font rendering issue
- [ ] Old browser version

**Fix**:
1. Try different browser (Chrome, Safari, Firefox)
2. Update browser to latest version
3. Check dev console for encoding errors

---

## ✅ Success Criteria

**Phase 3 Testing Complete When**:

- ✅ Annual subscription shows 4 glasses
- ✅ Quarterly subscription shows 1 glass
- ✅ Non-subscription products show no banner
- ✅ Multiple subscriptions show multiple banners
- ✅ Mobile rendering looks good
- ✅ No console errors
- ✅ Accessibility OK (keyboard nav, screen reader)
- ✅ Performance <100ms render time
- ✅ Emoji displays correctly
- ✅ Pricing shows correctly

---

## 📸 Documentation

**Please Capture**:
1. **Screenshot**: Annual subscription with 4 glasses
2. **Screenshot**: Quarterly subscription with 1 glass
3. **Screenshot**: Mobile view (iPhone)
4. **Screenshot**: Console showing no errors
5. **Video** (optional): Adding subscription to cart and seeing banner appear

**Store in**: `docs/session-notes/PHASE-3-TESTING-EVIDENCE/`

---

## 🎉 Next Steps After Testing

### If All Tests Pass ✅
→ Phase 3 is production-ready!  
→ Proceed to Phase 4 development

### If Issues Found 🔧
→ Document the issue in GitHub  
→ Create fix branch  
→ Update component  
→ Re-test

---

## 📞 Quick Reference

**Dev Store**: https://nudun-dev-store.myshopify.com  
**Admin**: https://nudun-dev-store.myshopify.com/admin  
**Checkout Editor**: Settings → Checkout → Extensibility → Edit checkout  

**Expected Test Duration**: 15-30 minutes  
**Difficulty**: Easy ✅ (visual testing, no coding required)

---

**Ready to test?** Let me know what you see! 🚀
