# 🆘 Shopify Dev Tunnel & Analytics Errors - Troubleshooting Guide

**Date**: 2025-10-21  
**Errors Encountered**:
1. ❌ "SendBeacon failed" 
2. ❌ "Server IP address could not be found"

---

## 📊 Error Analysis

### Error 1: "SendBeacon failed"
```
Error: SendBeacon failed
at https://cdn.shopify.com/.../context-slice-metrics-Dga1NYvDhyM7.js
```

**What This Means**:
- Shopify's analytics system can't send telemetry data
- NOT related to your extension code
- NOT a blocker for testing

**Why It Happens**:
- Network connectivity issue
- CDN blocked by firewall/proxy
- Browser privacy settings blocking analytics
- Shopify's CDN temporarily unavailable

**Impact**: 🟡 Low - Shopify admin still works, extension still renders

---

### Error 2: "duplicate-node-burn-side.trycloudflare.com's server IP address could not be found"
```
duplicate-node-burn-side.trycloudflare.com's server IP address could not be found.
```

**What This Means**:
- Browser can't resolve the Cloudflare tunnel domain
- DNS lookup failed
- Tunnel connection lost or URL is stale

**Why It Happens**:
1. **Tunnel dropped** - Dev server crashed or disconnected
2. **Network issue** - DNS/internet connectivity problem
3. **Stale URL** - Using old tunnel URL after reconnect
4. **Firewall/Proxy** - Blocking Cloudflare traffic

**Impact**: 🔴 Critical - Can't reach dev server

---

## ✅ Solution Steps

### Step 1: Verify Dev Server Status

```bash
# Check if npm dev is running
ps aux | grep "npm run dev"

# Expected output:
# node .../npm run dev  ← Still running
# ✅ If you see this, server is alive
```

### Step 2: Get Fresh Tunnel URL

**Option A: If dev server is running**
```bash
# In your dev server terminal, press 'p' to preview in browser
# This will show: "Preview URL: https://[NEW-URL].trycloudflare.com"
# Use this NEW URL (the old one is stale)
```

**Option B: If dev server crashed**
```bash
# Stop the old process
pkill -f "npm run dev"

# Restart dev server
npm run dev

# Wait 30-45 seconds for tunnel to establish
# Then copy the new URL from output:
# Preview URL: https://[NEW-URL].trycloudflare.com
```

### Step 3: Try New URL in Browser

1. **Copy the new tunnel URL** from dev server output
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Visit new URL** in incognito/private window
4. **Wait 5-10 seconds** for page to load

**Expected**: Page loads without DNS error

---

## 🔧 Advanced Troubleshooting

### Issue: "SendBeacon failed" but DNS works

**Solution 1: Ignore it** ✅ (Recommended)
- This error doesn't affect extension testing
- It's just Shopify analytics not working
- Your extension will still render fine

**Solution 2: Check firewall**
- Is `cdn.shopify.com` blocked by your firewall?
- Try: Open https://cdn.shopify.com in browser
- If it fails, contact your IT/network admin

**Solution 3: Disable browser extensions**
- Privacy extensions (uBlock, Privacy Badger) might block analytics
- Try opening Shopify in incognito mode
- These don't block extension testing anyway

---

### Issue: "Could not find IP address" persists

**Checklist**:
- [ ] Run `npm run dev` again (tunnel might be dead)
- [ ] Wait 60 seconds for new tunnel to establish
- [ ] Copy NEW URL from terminal (old URLs are stale after restart)
- [ ] Visit NEW URL in fresh browser window/tab
- [ ] Try incognito/private window (clears cache)
- [ ] Check your internet connection (ping google.com)
- [ ] Restart your computer (nuclear option)

**If Still Failing**:
```bash
# 1. Kill all node processes
pkill -f node

# 2. Clear npm cache
npm cache clean --force

# 3. Fresh restart
npm run dev

# 4. Wait for tunnel URL to appear (1-2 min)
# 5. Copy the URL and try in fresh browser
```

---

## 🎯 Testing Your Extension Without Tunnel Issues

### Option 1: Use Shopify CLI Direct Mode (if available)
```bash
# Instead of dev tunnel, use local preview
shopify app dev --tunnel=cloudflare --verbose
```

### Option 2: Use Different Browser
```bash
# Try Chrome, Firefox, Safari, or Edge
# Different browsers have different DNS/network handling
# One might work when others don't
```

### Option 3: Use Mobile Device on Same Network
```bash
# If tunnel URL works on desktop but not localhost
# Try accessing from iPhone/Android on same WiFi
# Uses different network path that might work better
```

### Option 4: Check Network Connectivity
```bash
# Is your internet actually working?
ping -c 4 google.com
# Should show: 4 packets transmitted, 4 received

# Can you reach Cloudflare?
ping 1.1.1.1
# Should respond (Cloudflare DNS)

# Can you reach Shopify?
ping shopify.com
# Should respond
```

---

## 📝 Expected vs Actual

### ✅ What Should Happen

1. Dev server starts: `npm run dev`
2. Tunnel creates: `Preview URL: https://xxx.trycloudflare.com`
3. Browser navigates to that URL
4. Shopify checkout editor loads
5. GlasswareMessage extension appears in sidebar
6. You drag extension into checkout layout
7. Component renders with test data

### ❌ What's Happening Now

1. Dev server running ✅
2. Tunnel created ✅
3. Browser tries to resolve tunnel URL
4. DNS fails: "could not find IP address"
5. Can't reach dev server

**Diagnosis**: DNS/network issue, not code issue

---

## 🚀 Next Steps

### If You Can Access the Tunnel

1. ✅ Drag GlasswareMessage into checkout
2. ✅ Create test order with annual subscription
3. ✅ Verify banner shows "🎉 4 Premium Glasses Included"
4. ✅ Test with quarterly subscription
5. ✅ Check mobile view

### If You Still Can't Access Tunnel

**Try These in Order**:
1. Restart dev server: `npm run dev`
2. Wait 2 minutes for tunnel
3. Copy NEW URL from terminal
4. Open in incognito window
5. If still fails, check network connectivity
6. Last resort: Restart your computer

---

## 🔍 Debug Checklist

- [ ] Dev server running? `ps aux | grep npm`
- [ ] Tunnel URL fresh? Check terminal, not old bookmarks
- [ ] Using NEW URL? Don't reuse old tunnel URLs
- [ ] Incognito window? Bypasses cache issues
- [ ] Internet working? `ping google.com`
- [ ] Firewall blocking Cloudflare? Check with IT
- [ ] VPN active? Try disabling it
- [ ] DNS working? `nslookup google.com`

---

## 📞 When to Ask for Help

**Ask if**:
- DNS error persists after 3 restart attempts
- Internet connectivity is confirmed but still failing
- Different browsers all show same error
- Error appears on multiple devices

**Provide**:
- Full error message
- Terminal output from `npm run dev`
- Result of `npm audit`
- Your network setup (corporate/home/VPN?)
- Which browsers tried (Chrome, Firefox, Safari?)

---

## ✨ The Good News

- ✅ Your code is fine (no TypeScript errors)
- ✅ Extension builds successfully
- ✅ Dev server is running
- ✅ This is a network/tunnel issue, not a code issue
- ✅ Easily fixable with tunnel restart

**Your extension is ready to test - just need to get past these network issues!**

---

**Last Updated**: 2025-10-21  
**Related Docs**: 
- `SHOPIFY-API-CONTRACT-2025-10.md` (API reference)
- `TESTING-PHASE-3-SHOPIFY.md` (Testing guide)
