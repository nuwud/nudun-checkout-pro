# Shopify Approval Quick Reference Card

**Print this out or keep it visible while coding** 🎯

---

## The Golden Rule
**If you're not sure it will pass Shopify review, DON'T ship it.**

---

## ✅ Always Do This

### In Extensions
```jsx
// Safe data access
const value = shopify?.property?.nested?.value;

// Check before using
if (!value) {
  return null; // or show fallback UI
}

// No external scripts, no tracking pixels
```

### In Admin Routes
```typescript
// Wrap all API calls
try {
  const response = await admin.graphql(query);
  if (!response.ok) {
    throw new Error('API failed');
  }
  const data = await response.json();
  if (data.errors) {
    console.error('GraphQL errors:', data.errors);
    return fallback;
  }
  return data;
} catch (error) {
  console.error(error);
  return fallback;
}
```

### With User Input
```typescript
// Validate everything
if (!input || typeof input !== 'string' || input.length > 100) {
  throw new Error('Invalid input');
}

// Sanitize
const clean = input.trim().toLowerCase();
```

### With Webhooks
```typescript
// Always verify
const { shop, session, topic } = await authenticate.webhook(request);
```

---

## ❌ Never Do This

### In Production Code
```typescript
// ❌ Don't use @ts-ignore
// @ts-ignore
const value = shopify.cost.totalAmount.value;

// ❌ Don't assume data exists
const value = shopify.cost.totalAmount.value; // crashes if undefined

// ❌ Don't skip error handling
const data = await response.json(); // what if it fails?

// ❌ Don't trust user input
const value = merchantInput; // validate first!
```

### In Extensions
```jsx
// ❌ Don't load external scripts
<script src="https://external.com/script.js"></script>

// ❌ Don't add tracking pixels
<img src="https://tracking.com/pixel.gif" />

// ❌ Don't break checkout
throw new Error('App crashed'); // handle gracefully!
```

---

## Before Every Commit

- [ ] Does it have error handling?
- [ ] Does it handle missing data gracefully?
- [ ] Did I validate user inputs?
- [ ] Did I test on mobile?
- [ ] Is there a loading state?
- [ ] Did I remove debug console.logs?
- [ ] No `@ts-ignore` in production code?

---

## Before Every Feature

- [ ] Read the checklist: `SHOPIFY-APPROVAL-CHECKLIST.md`
- [ ] Review patterns in `.github/copilot-instructions.md`
- [ ] Check security implications
- [ ] Plan error handling approach

---

## Testing Checklist

- [ ] Works with empty cart
- [ ] Works with full cart
- [ ] Works with network failures
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works with keyboard only
- [ ] Works with screen reader

---

## When In Doubt

1. Check `SHOPIFY-APPROVAL-CHECKLIST.md`
2. Look for similar pattern in Shopify docs
3. Ask: "Would I trust this with my credit card?"
4. If still unsure: **err on the side of caution**

---

## Emergency: Code Review Failed

If Shopify review finds issues:

1. **Don't panic** - It's normal to need revisions
2. Read their feedback carefully
3. Check `SHOPIFY-APPROVAL-CHECKLIST.md` for the relevant section
4. Fix the issue thoroughly (not just the symptom)
5. Test extensively before resubmitting
6. Update this checklist with the lesson learned

---

## Key Resources

- `SHOPIFY-APPROVAL-CHECKLIST.md` - Full compliance guide
- `SHOPIFY-COMPLIANCE-UPDATE.md` - What we changed and why
- `.github/copilot-instructions.md` - Development patterns
- [Shopify App Review](https://shopify.dev/docs/apps/launch/app-review)
- [Security Best Practices](https://shopify.dev/docs/apps/best-practices/security)

---

## Quick Win Checklist

Want to improve approval chances? Do these first:

- [ ] Add comprehensive error handling to all routes
- [ ] Implement webhook HMAC verification
- [ ] Create privacy policy page (`/app/routes/app.privacy.tsx`)
- [ ] Add uninstall cleanup (`webhooks.app.uninstalled.tsx`)
- [ ] Test on real Shopify store (not just dev store)
- [ ] Add loading states everywhere
- [ ] Implement rate limiting for API calls
- [ ] Add mobile-responsive CSS

---

**Remember**: Shopify review protects merchants and their customers. Every security measure, every error check, every graceful fallback makes commerce safer for everyone. 🛡️
