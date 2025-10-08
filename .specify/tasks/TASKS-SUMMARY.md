# Task Breakdown Summary: Dynamic Messaging Engine v1.0

**Date**: 2025-10-07  
**Branch**: `feature/included-glassware`  
**Phase**: Tasks Complete ✅ → Ready for Implementation

---

## 🎯 Key Enhancement: Glass Value Display

### Your Questions Answered

**Q1: "Can it also detect by words from product title?"**  
✅ **YES** - Already planned! Detection works via title keywords:
- "quarterly" → 1 glass
- "annual" → 4 glasses  
- "subscription" → 1 glass (generic)

**Q2: "Can included items be tied to store items without incurring purchase just to show value?"**  
✅ **YES** - NEW ENHANCEMENT ADDED!

**Implementation**: 
- **T006**: New utility `glassProductLookup.js` fetches glass product price from store
- Looks up product by handle: "premium-glass"
- Extracts price: `{ amount: "25.00", currencyCode: "USD" }`
- **No purchase required** - just displays the value
- Caches result to avoid repeated queries

**Q3: "Show value to exemplify what a great deal this is and prevent customers from buying glasses separately?"**  
✅ **YES** - Enhanced messaging includes value!

**New Message Format**:
```
Quarterly: "Includes **1** premium glass ($25 value)"
Annual:    "Includes **4** premium glasses ($100 value)"
```

---

## 📋 Task Breakdown Overview

### Total Scope
- **Tasks**: 35 total (31 implementation + 4 validation)
- **Duration**: 20 hours (~2.5 days solo)
- **MVP Duration**: 11.5 hours (~1.5 days)
- **Parallel Tasks**: 8 (can run simultaneously)

### 10 Phases

| Phase | Purpose | Duration | Key Tasks |
|-------|---------|----------|-----------|
| **1. Setup** | Test infrastructure | 1h | Add Vitest, create test dirs |
| **2. Foundation** | Core utilities (BLOCKING) | 3h | Detection + **Price lookup** |
| **3. US1 (P1)** | Quarterly with value | 5h | Component + integration |
| **4. US2 (P2)** | Annual with total value | 2h | Plural support |
| **5. US3 (P3)** | Localization | 1h | French translations |
| **6. US4 (P3)** | Accessibility | 1.5h | WCAG 2.1 compliance |
| **7. Config** | Extension targets | 1h | Line-item rendering |
| **8. Testing** | Manual E2E | 3h | 11 test cases |
| **9. Polish** | Documentation | 2h | README + patterns |
| **10. Validation** | Final checks | 1h | Constitution + PR |

---

## 🎯 NEW: Glass Value Display Architecture

### T006: Glass Product Price Lookup Utility (NEW)

**File**: `src/utils/glassProductLookup.js`

**Purpose**: Fetch glass product price from Shopify store without requiring purchase

**Implementation**:
```javascript
export async function getGlassProductPrice() {
  // Query Shopify Storefront API
  const product = await shopify.query(`
    query {
      product(handle: "premium-glass") {
        variants(first: 1) {
          edges {
            node {
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `);
  
  // Extract price
  const variant = product?.variants?.edges?.[0]?.node;
  if (!variant) {
    return { price: null, found: false };
  }
  
  // Return price object
  return {
    price: variant.price,
    found: true
  };
}
```

**Key Features**:
- ✅ No purchase required (read-only query)
- ✅ Uses product handle: "premium-glass" (configurable)
- ✅ Returns Money object: `{ amount: "25.00", currencyCode: "USD" }`
- ✅ Null safety: Returns `{ price: null, found: false }` if product missing
- ✅ Caching: Stores result to avoid repeated queries

### T010: Enhanced Component with Value Display

**File**: `src/components/GlasswareMessage.jsx`

**Props**: `{ glassCount, glassPrice, locale }`

**New Logic**:
```jsx
function GlasswareMessage({ glassCount, glassPrice, locale }) {
  // Determine localization key
  const hasValue = glassPrice !== null;
  const isPlural = glassCount > 1;
  
  let key;
  if (hasValue) {
    key = isPlural ? 'glasswareIncludesPluralWithValue' : 'glasswareIncludesSingularWithValue';
  } else {
    key = isPlural ? 'glasswareIncludesPlural' : 'glasswareIncludesSingular';
  }
  
  // Format price
  const formattedPrice = hasValue 
    ? shopify.i18n.formatCurrency(glassPrice.amount, glassPrice.currencyCode)
    : null;
  
  // Translate message
  const message = shopify.i18n.translate(key, {
    count: glassCount,
    price: formattedPrice
  });
  
  return (
    <s-block-stack>
      <s-image src="..." alt="Premium glass included" />
      <s-text emphasis="bold">{message}</s-text>
    </s-block-stack>
  );
}
```

**Message Examples**:
- With value: "Includes **1** premium glass ($25.00 value)"
- Without value: "Includes **1** premium glass" (fallback if price unavailable)
- Annual: "Includes **4** premium glasses ($100.00 value)"

### New Localization Keys

**English** (`en.default.json`):
```json
{
  "glasswareIncludesSingular": "Includes **{{count}}** premium glass",
  "glasswareIncludesSingularWithValue": "Includes **{{count}}** premium glass ({{price}} value)",
  "glasswareIncludesPlural": "Includes **{{count}}** premium glasses",
  "glasswareIncludesPluralWithValue": "Includes **{{count}}** premium glasses ({{price}} value)",
  "glasswareImageAlt": "Premium glass included"
}
```

**French** (`fr.json`):
```json
{
  "glasswareIncludesSingular": "Comprend **{{count}}** verre premium",
  "glasswareIncludesSingularWithValue": "Comprend **{{count}}** verre premium (valeur de {{price}})",
  "glasswareIncludesPlural": "Comprend **{{count}}** verres premium",
  "glasswareIncludesPluralWithValue": "Comprend **{{count}}** verres premium (valeur de {{price}})",
  "glasswareImageAlt": "Verre premium inclus"
}
```

---

## 🚀 Implementation Paths

### Path 1: MVP First (Recommended)

**Goal**: Ship quarterly subscriptions with value ASAP

**Steps**:
1. ✅ T001-T006: Setup + Foundation (4h) - Includes price lookup!
2. ✅ T007-T011: US1 Implementation (5h) - Quarterly with value
3. ✅ T025-T026: Extension config (1h)
4. ✅ T027: Manual testing (US1 only) (1.5h)
5. 🚀 **SHIP MVP**: 11.5 hours total

**Result**: Customers see "Includes **1** premium glass ($25 value)"

### Path 2: Full Feature

**Goal**: All 4 user stories complete

**Steps**:
1. ✅ Foundation (4h)
2. ✅ US1 (5h) + US2 (2h) + US3 (1h) + US4 (1.5h)
3. ✅ Config + Testing + Polish (6h)
4. 🚀 **SHIP COMPLETE**: 19.5 hours total

**Result**: Quarterly, annual, French, accessible - all with value display

### Path 3: Parallel Team (4 Developers)

**Goal**: Ship everything in 1.5 days

**Steps**:
1. ✅ All: Foundation together (4h)
2. ✅ Split user stories (5h max):
   - Dev A: US1 (5h)
   - Dev B: US2 (2h)
   - Dev C: US3 (1h)
   - Dev D: US4 (1.5h)
3. ✅ Dev A: Config + Testing (4h)
4. ✅ All: Polish together (2h)

**Timeline**: ~1.5 days parallelized

---

## 📊 Task Statistics

### By Phase
- **Setup**: 3 tasks (1h)
- **Foundation**: 3 tasks (3h) ← Includes NEW price lookup
- **User Stories**: 20 tasks (9.5h)
- **Config**: 2 tasks (1h)
- **Testing**: 2 tasks (3h)
- **Polish**: 3 tasks (2h)
- **Validation**: 2 tasks (1h)

### By Type
- **Implementation**: 21 tasks (14h)
- **Tests (TDD)**: 7 tasks (4.5h)
- **Localization**: 4 tasks (0.5h)
- **Manual Validation**: 6 tasks (2h)
- **Documentation**: 3 tasks (2h)

### By User Story
- **US1 (P1)**: 5 tasks (5h) - Quarterly with value ← MVP
- **US2 (P2)**: 4 tasks (2h) - Annual with total value
- **US3 (P3)**: 3 tasks (1h) - French localization
- **US4 (P3)**: 5 tasks (1.5h) - Accessibility

---

## 🎯 Success Metrics

### Technical (Measured at T028)
- ✅ Bundle size: <50KB
- ✅ Render time: <100ms (even with price lookup)
- ✅ Test coverage: 100% detection, 90%+ component
- ✅ Lighthouse: ≥95 accessibility score

### Functional (Validated at T027)
- ✅ Detection accuracy: 100% (with keywords)
- ✅ Price accuracy: Matches store product exactly
- ✅ Localization: 2 locales, 100% key coverage
- ✅ Error rate: 0 JavaScript errors
- ✅ Mobile: Works on 320px+ viewports

### Business Impact (Phase 3 Analytics - Future)
- 🎯 Conversion lift: +5% quarterly, +10% annual
- 🎯 Support tickets: -30% "what's included?"
- 🎯 Glass purchases: -50% duplicate purchases
- 🎯 Perceived value: Customers see $25-$100 value included

---

## 🛡️ Risk Mitigation

### Risk: Glass Product Not Found

**Mitigation** (T006a):
- Check if "premium-glass" product exists in store
- If missing: Create product via Shopify admin
- Product setup:
  - Title: "Premium Glass"
  - Handle: "premium-glass"
  - Price: $25.00 USD
  - Published: Yes

**Fallback**:
- If product not found: Component shows message without value
- Example: "Includes **1** premium glass" (no price)
- Still provides value, just missing dollar amount

### Risk: Price Lookup Performance

**Mitigation**:
- Cache price result after first fetch
- Query runs once per checkout session
- Async loading: Message shows immediately, price appears when ready
- Timeout: If query takes >500ms, show message without value

---

## 📝 Commit Strategy

**Total Commits**: ~17-18 atomic commits

**Commit Template**:
```bash
# Foundation
git commit -m "feat: Add glass product price lookup utility" # T006 (NEW)

# US1 Implementation
git commit -m "feat: Add GlasswareMessage component with value display" # T010 (ENHANCED)

# US2 Enhancement
git commit -m "feat: Add plural support to GlasswareMessage component" # T014 (ENHANCED)
```

**Each commit**:
- One logical change
- Conventional commits format (feat/test/docs/config/refactor)
- Descriptive message with task ID reference

---

## 🎉 Why This Enhancement is Excellent

### Before (Original Plan)
```
"Includes 1 premium glass"
```
- ✅ Shows glass is included
- ❌ No perceived value
- ❌ Customers might buy glass separately

### After (Enhanced with Value)
```
"Includes 1 premium glass ($25 value)"
```
- ✅ Shows glass is included
- ✅ **Emphasizes $25 value (converts better!)**
- ✅ **Prevents duplicate purchases**
- ✅ **Increases perceived subscription value**

### Business Impact

**Quarterly Subscription**:
- Customer sees: "$50/quarter + $25 glass included"
- Perceived value: $75 total
- **Conversion boost**: Emphasizes value vs. one-time purchase

**Annual Subscription**:
- Customer sees: "$180/year + $100 worth of glasses included"
- Perceived value: $280 total
- **Conversion boost**: Makes annual commitment more attractive

**Duplicate Purchase Prevention**:
- Customer thinking: "I need a glass..."
- Sees message: "Includes 1 premium glass ($25 value)"
- **Avoids confusion**: "Oh, it's already included!"

---

## 🔄 Next Steps

**Immediate**: You can now:

1. **Option A**: Run `/speckit.implement` for automated implementation (if available)

2. **Option B**: Start manual implementation:
   ```bash
   # Start with Foundation (BLOCKING)
   # T001-T003: Setup test infrastructure (1h)
   # T004-T006: Build detection + price lookup (3h)
   
   # Then US1 (MVP)
   # T007-T011: Build component + integration (5h)
   
   # Total to MVP: 9 hours
   ```

3. **Option C**: Review tasks first:
   - Open `.specify/tasks/included-glassware-tasks.md`
   - Read through all 35 tasks
   - Identify any questions or concerns
   - Then start implementation

**Recommended**: Option B (manual implementation) - gives you full control and learning

---

## 📚 Documents Available

1. **`.specify/specs/included-glassware.md`** - Feature specification (what & why)
2. **`.specify/plans/included-glassware-plan.md`** - Implementation plan (how)
3. **`.specify/plans/PLAN-SUMMARY.md`** - Executive summary
4. **`.specify/tasks/included-glassware-tasks.md`** - This task breakdown (actionable steps)
5. **`.specify/WORKFLOW-STATUS.md`** - Current status tracker

**Quick Access**:
```bash
# View tasks
cat .specify/tasks/included-glassware-tasks.md

# View specific phase
grep -A 20 "## Phase 2: Foundational" .specify/tasks/included-glassware-tasks.md

# Track progress
code .specify/WORKFLOW-STATUS.md
```

---

**Tasks Version**: 1.0.0  
**Enhancement**: Glass value display from store prices  
**Ready**: ✅ All planning complete, ready to code!  
**Git Commit**: af213aa

🚀 **You're ready to build!** The foundation for an extensible Dynamic Messaging Engine with value-driven subscription messaging. 🎉
