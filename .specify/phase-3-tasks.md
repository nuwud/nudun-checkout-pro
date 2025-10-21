# Phase 3 Actionable Tasks

## Task Breakdown

### T007: Create GlasswareMessage Component File
**Status**: Not Started  
**Effort**: 4 hours  
**Acceptance Criteria**:
- [ ] `src/GlasswareMessage.jsx` created with basic Preact component structure
- [ ] JSDoc typedefs for component props and return types
- [ ] Import statements for utilities (detectSubscription, getIncludedItemPrice)
- [ ] Import statements for Polaris web components
- [ ] Preact hooks imported (useState, useEffect, useMemo)
- [ ] Empty render function returns null (to verify file works)
- [ ] No TypeScript errors
- [ ] File builds successfully

**Deliverable**: Skeleton component ready for logic implementation

---

### T008: Implement Subscription Detection Logic
**Status**: Not Started  
**Effort**: 3 hours  
**Acceptance Criteria**:
- [ ] Component reads `shopify.lines.value` reactively
- [ ] Loops through all cart line items
- [ ] Calls `detectSubscription()` for each line
- [ ] Accumulates total glass count from all subscriptions
- [ ] Identifies "primary" subscription (highest glass count)
- [ ] Handles empty cart gracefully
- [ ] Handles missing/malformed line items gracefully
- [ ] Returns early (null) if no subscriptions detected
- [ ] No console errors in dev store

**Deliverable**: Component correctly identifies subscriptions and glass count

---

### T009: Implement Product Lookup & Price Display
**Status**: Not Started  
**Effort**: 3 hours  
**Acceptance Criteria**:
- [ ] Component calls `getIncludedItemPrice('premium-glass')` async
- [ ] Stores price in component state using `useState`
- [ ] Handles price lookup errors silently
- [ ] Displays "$X.XX USD" when price found
- [ ] Displays "Premium Value Included" when price not found
- [ ] Caching verified (lookup only once per session)
- [ ] Works with different currencies
- [ ] No broken checkout experience if lookup fails
- [ ] TypeScript errors from product lookup resolved

**Deliverable**: Price correctly fetched, displayed, and cached

---

### T010: Build Banner UI with Polaris Components
**Status**: Not Started  
**Effort**: 4 hours  
**Acceptance Criteria**:
- [ ] `<s-banner>` component with tone="success"
- [ ] `<s-heading>` with subscription messaging
- [ ] `<s-text>` with glass count + price + value
- [ ] `<s-text>` with optional renewal date (e.g., "Next: Dec 21")
- [ ] Multiple variants (annual vs quarterly vs generic)
- [ ] Responsive layout on mobile (stack vertically)
- [ ] Color contrast meets WCAG AA standards
- [ ] Component renders without errors in checkout
- [ ] Mobile viewport tested (375px width)
- [ ] Accessibility: proper heading hierarchy
- [ ] Accessibility: descriptive text for screen readers

**Deliverable**: Polished, accessible banner UI ready for testing

---

### T011: Create Comprehensive Test Suite
**Status**: Not Started  
**Effort**: 5 hours  
**Acceptance Criteria**:
- [ ] Test file `__tests__/GlasswareMessage.test.js` created
- [ ] 15+ test cases covering all scenarios:
  - Annual subscription (4 glasses)
  - Quarterly subscription (1 glass)
  - Generic subscription (1 glass)
  - No subscription (null render)
  - Multiple subscriptions (total counted)
  - Price found (displays value)
  - Price not found (degrades gracefully)
  - Empty cart (null render)
  - Malformed line items (skip safely)
  - shopify global undefined (null render)
  - Mobile viewport (responsive)
  - Different currencies (USD, EUR, CAD)
  - Component unmounts (cleanup)
  - Re-render on cart change (updates)
  - Error handling (silent logging)
- [ ] All tests passing (npm test -- --run)
- [ ] >90% code coverage
- [ ] No TypeScript errors in tests
- [ ] Test descriptions are clear and actionable

**Deliverable**: Comprehensive test suite with 15+ passing tests

---

### T012: Integration & Performance Testing
**Status**: Not Started  
**Effort**: 3 hours  
**Acceptance Criteria**:
- [ ] Component integrated into `Checkout.jsx`
- [ ] Bundle size measured: <10KB gzipped
- [ ] Render time measured: <100ms
- [ ] Manual test in dev store checkout preview
- [ ] Test annual subscription flow (4 glasses)
- [ ] Test quarterly subscription flow (1 glass)
- [ ] Test non-subscription flow (no banner)
- [ ] Mobile checkout tested (iOS Safari, Android Chrome)
- [ ] No console errors in browser devtools
- [ ] No TypeScript errors (npm run typecheck)
- [ ] All existing tests still passing
- [ ] Performance audit recorded (render time, bundle size)

**Deliverable**: Component integrated, tested, and optimized

---

## Task Sequence

```
T007 (4h)  ──→  T008 (3h)  ──→  T009 (3h)  ──→  T010 (4h)
Component       Subscriptions    Product         UI & Styling
Scaffold        Detection        Lookup

                                                      ↓
                                                T011 (5h)
                                                Tests

                                                      ↓
                                                T012 (3h)
                                                Integration
```

**Total Phase 3 Effort**: ~22 hours  
**Recommended Timeline**: 3-4 days (assuming 6-8 hours/day focused dev)

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review specification in `phase-3-glassware-message.md`
- [ ] Review implementation plan in `phase-3-implementation-plan.md`
- [ ] Verify utilities work: `detectSubscription()`, `getIncludedItemPrice()`
- [ ] Test utilities in dev store with real cart data

### T007: Component File Creation
- [ ] Create `src/GlasswareMessage.jsx`
- [ ] Add JSDoc typedefs
- [ ] Import utilities and Preact components
- [ ] Verify no build errors
- [ ] Commit: "refactor: Create GlasswareMessage component skeleton"

### T008: Subscription Logic
- [ ] Implement subscription detection loop
- [ ] Add error handling for malformed items
- [ ] Add early return for no subscriptions
- [ ] Test with real cart data
- [ ] Commit: "feat: Add subscription detection to GlasswareMessage"

### T009: Product Lookup
- [ ] Implement async price lookup
- [ ] Add state management for price
- [ ] Add error handling and graceful degradation
- [ ] Verify caching works
- [ ] Commit: "feat: Implement product lookup and price display"

### T010: UI Building
- [ ] Create banner variants (annual/quarterly/generic)
- [ ] Style for mobile responsiveness
- [ ] Verify accessibility
- [ ] Test in checkout preview
- [ ] Commit: "feat: Build GlasswareMessage banner UI"

### T011: Testing
- [ ] Create test file structure
- [ ] Write and run 15+ tests
- [ ] Achieve >90% coverage
- [ ] Fix any failing tests
- [ ] Commit: "test: Add comprehensive GlasswareMessage tests"

### T012: Integration
- [ ] Integrate into `Checkout.jsx`
- [ ] Measure bundle size and render time
- [ ] Manual testing in dev store
- [ ] Verify all tests still pass
- [ ] Commit: "feat: Integrate GlasswareMessage into checkout extension"
- [ ] Deploy: `npm run deploy -- --force`

---

## Success Criteria for Phase 3 Completion

- ✅ All 6 tasks completed
- ✅ 15+ component tests passing
- ✅ Subscription detection working correctly
- ✅ Price display working or gracefully degrading
- ✅ Banner UI looks good on mobile
- ✅ No TypeScript errors
- ✅ Bundle size <10KB
- ✅ Render time <100ms
- ✅ Manual testing in dev store successful
- ✅ Ready for Phase 4 (Analytics & A/B Testing)

---

## Phase 4 Preview (Future)

Once Phase 3 is complete, Phase 4 will add:
- Event tracking (which subscriptions are shown)
- A/B testing framework (variant banners)
- Analytics dashboard
- Export functionality
- Advanced personalization

---

**Ready to start Phase 3? Let me know if you want to begin with T007!**
