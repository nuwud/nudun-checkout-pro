# Debugging Lessons Learned: What Slowed Down the Process

**Date**: October 7, 2025  
**Issue**: Extension throwing "TypeError: (0, a.default) is not a function"  
**Time to Resolution**: ~2-3 hours (multiple attempts before breakthrough)  
**Root Cause**: Using wrong API pattern (vanilla JS instead of Preact JSX)

---

## Executive Summary

The extension debugging took significantly longer than necessary due to **fundamental misunderstanding of the API version**. The key breakthrough came when the user said "Check for other Checkout page rules" which led to discovering that **Shopify Checkout UI Extensions API 2025-10 uses Preact JSX**, not the vanilla JavaScript API.

---

## What Slowed Down the Process

### 1. **Incorrect API Documentation Assumptions** 🚨 CRITICAL

**Problem**: Initial implementations followed vanilla JavaScript patterns like:
```javascript
export default (root) => {
  const banner = root.createComponent('Banner', {...});
  root.appendChild(banner);
};
```

**Why This Failed**:
- This API pattern **does not exist** in version 2025-10
- Shopify moved to Preact-based JSX in newer versions
- Old documentation/examples still circulated online
- No clear deprecation warnings in error messages

**How to Avoid**:
- ✅ **Always verify the exact API version** in `shopify.extension.toml`
- ✅ **Check Shopify's official 2025-10 API docs** first, not Google results
- ✅ **Look for "API version" in error messages** (though Shopify doesn't always provide this)
- ✅ **Search for version-specific examples** like "Shopify checkout 2025-10 example"

**Lesson**: Generic error messages like "not a function" don't reveal API version mismatches. Always start by confirming the API contract.

---

### 2. **Multiple Store/App Confusion**

**Problem**: User had two stores and two apps in different organizations:
- Initial attempts used wrong app (ID 282796089601, different org)
- Correct app was NUDUN Checkout Pro (ID 286617272321) in Nuwud Multimedia org
- Store needed to be nudun-dev-store with "Checkout Extensibility" enabled

**Why This Failed**:
- Extension built successfully but never rendered
- No clear error about store compatibility
- Spent time debugging code when it was a configuration issue

**How to Avoid**:
- ✅ **Document the correct app/store IDs** in project README or config file
- ✅ **Verify store capabilities** (`Checkout and Customer Accounts Extensibility` feature flag)
- ✅ **Check app installation status** in store admin before debugging code
- ✅ **Use environment-specific config files** (shopify.app.nudun-checkout-pro.toml)

**Lesson**: Configuration issues look identical to code bugs. Always verify the environment before deep debugging.

---

### 3. **Lack of Clear API Version Migration Guide**

**Problem**: No obvious "migrating from vanilla JS to Preact" guide in Shopify docs.

**Why This Failed**:
- Spent time trying to fix vanilla JS code instead of rewriting
- Attempted multiple variations of the wrong pattern
- No clear signal that the entire approach was outdated

**How to Avoid**:
- ✅ **Create internal migration guides** when API versions change
- ✅ **Add "API Version" section** to all extension documentation
- ✅ **Include working examples** for the current version in README
- ✅ **Document deprecated patterns** with clear "DO NOT USE" warnings

**Lesson**: When debugging fails repeatedly, question fundamental assumptions about the API contract.

---

### 4. **Generic Error Messages**

**Problem**: Error was "TypeError: (0, a.default) is not a function" with no context about:
- What was trying to call a function
- What the expected API pattern should be
- Which API version was in use
- Where the error originated (build vs runtime)

**Why This Failed**:
- No actionable information in the error
- Could be caused by dozens of different issues
- Impossible to Google effectively (too generic)

**How to Avoid**:
- ✅ **Add verbose error handling** in extension code
- ✅ **Use try/catch blocks** around Shopify API calls
- ✅ **Log API version and environment** on extension load
- ✅ **Create custom error boundaries** that show more context

**Lesson**: When errors are generic, add instrumentation to capture more context before the error occurs.

---

### 5. **Money Object Confusion (Secondary Issue)**

**Problem**: After extension worked, discovered `shopify.cost.totalAmount.value` returns an object, not a number.

**Why This Was Confusing**:
- Name suggests a simple value
- TypeScript types weren't clear
- Display showed "[object Object]" instead of amount

**How to Avoid**:
- ✅ **Document all Shopify data structures** (like Money object) in reference guide
- ✅ **Add inline comments** explaining object structures
- ✅ **Create TypeScript interfaces** for Shopify global objects
- ✅ **Test display immediately** when accessing new data

**Lesson**: Shopify's global `shopify` object has complex nested structures. Don't assume primitives.

---

## Timeline Analysis: What Worked vs What Didn't

### ❌ What Didn't Work (Wasted Time)

1. **Multiple attempts with vanilla JS API** (~30-45 minutes)
   - Tried different component names
   - Tried different property names
   - Tried different export formats
   - All using wrong API entirely

2. **Debugging build process** (~15-20 minutes)
   - Checked Vite config
   - Checked TypeScript config
   - Checked dependencies
   - Build was fine, API pattern was wrong

3. **Store configuration confusion** (~20-30 minutes)
   - Switched between apps
   - Checked store features
   - Verified installation
   - Eventually found correct store

### ✅ What Finally Worked (Breakthrough)

1. **User's prompt: "Check for other Checkout page rules"** - Led to researching checkout editor
2. **Discovered Preact JSX requirement** in official docs for 2025-10
3. **Complete rewrite** using `render()` pattern - **Worked immediately**
4. **Money object fix** - Quick once structure was understood

**Key Breakthrough**: Questioning the fundamental API approach instead of tweaking details.

---

## Red Flags That Should Have Triggered API Version Check

Looking back, these signals should have prompted API version verification sooner:

1. ✅ **Generic "not a function" error** - Usually means wrong API contract
2. ✅ **Extension building but not rendering** - Suggests compatibility issue, not code bug
3. ✅ **No clear line number in error** - Runtime API mismatch, not syntax error
4. ✅ **Working examples online looked different** - Should have checked what version they used
5. ✅ **Multiple patterns attempted, all failed** - Pattern itself was likely wrong

---

## Recommendations for Future Development

### For Copilot/AI Agents

1. **Always check API version first** when debugging extension errors
   - Look in `shopify.extension.toml` for `api_version`
   - Search for version-specific documentation
   - Verify the example code matches the API version

2. **Question fundamental assumptions** after 2-3 failed attempts
   - If multiple variations of the same pattern fail, the pattern is likely wrong
   - Check if API has changed or if using deprecated approach
   - Look for "migration guide" or "changelog" documentation

3. **Document the correct pattern immediately** after breakthrough
   - Add to copilot-instructions.md
   - Create reference documents
   - Include "wrong way vs right way" examples

4. **Verify environment before deep debugging**
   - Check store capabilities
   - Verify app installation
   - Confirm correct app/store IDs
   - Test with minimal working example

### For Human Developers

1. **Start with official docs for exact API version**
   - Don't trust old Stack Overflow answers
   - Check the date on blog posts/tutorials
   - Verify API version matches project config

2. **Create a minimal working example first**
   - Get "Hello World" rendering before adding features
   - Confirms API pattern is correct
   - Establishes baseline for debugging

3. **Document configuration clearly**
   - Which store to use
   - Which app ID is correct
   - What feature flags are required
   - Environment-specific settings

4. **Add verbose logging early**
   - Log when extension loads
   - Log data structures received
   - Log before API calls fail
   - Makes debugging exponentially faster

---

## Specific Debugging Checklist for Extensions

When a Shopify extension isn't working, follow this order:

### Phase 1: Environment (5 minutes)
- [ ] Verify correct store is selected
- [ ] Check store has "Checkout Extensibility" enabled
- [ ] Confirm app is installed in store
- [ ] Verify using correct app ID
- [ ] Check extension is placed in checkout editor

### Phase 2: API Version (5 minutes)
- [ ] Check `api_version` in shopify.extension.toml
- [ ] Find official docs for that exact version
- [ ] Verify export pattern matches version
- [ ] Check if using deprecated APIs

### Phase 3: Build & Dependencies (5 minutes)
- [ ] Verify extension builds without errors
- [ ] Check all dependencies are installed
- [ ] Confirm TypeScript types are generated
- [ ] Look for deprecation warnings

### Phase 4: Code (Only after above passes)
- [ ] Add console.logs or error boundaries
- [ ] Test with minimal example
- [ ] Verify data structures match expectations
- [ ] Check optional chaining for null safety

**Key Point**: Most issues are in Phase 1-2, but developers instinctively jump to Phase 4.

---

## What Would Have Saved Time

If we had this information upfront:

1. **Clear statement**: "2025-10 uses Preact JSX, not vanilla JS"
   - Saved: 30-45 minutes of wrong pattern attempts

2. **Working minimal example** for 2025-10 in README
   - Saved: 15-20 minutes of experimentation

3. **Store configuration documented** with correct IDs
   - Saved: 20-30 minutes of app/store confusion

4. **Money object structure documented** in advance
   - Saved: 10-15 minutes of display debugging

**Total Time Saved**: ~75-110 minutes (1.5-2 hours)

---

## Key Takeaways for Copilot Instructions

### Add to .github/copilot-instructions.md:

1. **API Version Section**
   ```markdown
   ## CRITICAL: Always Verify API Version First
   
   Before debugging any extension error:
   1. Check `shopify.extension.toml` for `api_version`
   2. Search for official docs: "Shopify Checkout UI Extensions [version]"
   3. Verify export pattern matches version requirements
   4. Check if error message mentions deprecated APIs
   ```

2. **Debugging Order Section**
   ```markdown
   ## Extension Debugging Order
   
   Follow this order (don't skip steps):
   1. Environment: Store, app, installation, placement
   2. API Version: Pattern, exports, dependencies
   3. Build: Compilation, types, warnings
   4. Code: Logic, data structures, null safety
   ```

3. **Known Patterns Section**
   ```markdown
   ## API Version Patterns
   
   ### 2025-10 (CURRENT)
   ✅ Uses Preact JSX with render()
   ✅ Import from '@shopify/ui-extensions/preact'
   ✅ Export async function that calls render()
   
   ### Pre-2025 (DEPRECATED)
   ❌ Vanilla JS with root.createComponent()
   ❌ Do NOT use these patterns
   ```

---

## Conclusion

**Root Cause**: Using deprecated API pattern without realizing API had fundamentally changed.

**Primary Lesson**: When debugging fails repeatedly, question the API contract itself, not just the implementation details.

**Secondary Lesson**: Configuration issues (wrong store, wrong app) are indistinguishable from code bugs without explicit verification.

**Action Items**:
1. ✅ Document API version explicitly in all extension files
2. ✅ Create minimal working examples for current API version
3. ✅ Add environment verification to debugging workflow
4. ✅ Document Money object and other Shopify data structures
5. ✅ Update copilot-instructions.md with debugging checklist

**Time Lost**: ~2-3 hours  
**Time That Could Have Been Saved**: ~1.5-2 hours (66-75%)  
**Future Prevention**: High confidence - clear documentation and verification checklist will prevent similar issues

---

**Last Updated**: October 7, 2025  
**Status**: Foundation complete, lessons documented for future development
