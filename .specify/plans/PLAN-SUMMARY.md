# Implementation Plan Summary: Dynamic Messaging Engine v1.0

**Date**: 2025-10-07  
**Branch**: `feature/included-glassware`  
**Phase**: Planning Complete ✅ → Ready for Task Breakdown

---

## 🎯 Key Insight: Extensible Architecture

You said: *"Doesn't need to be exclusive to glassware, that is just first use-case."*

**Impact**: Transformed from single-purpose feature → **Dynamic Messaging Engine** foundation

**Architecture Pattern**:
```
Detection Utilities → Message Components → Orchestration Layer
      (Data)              (Presentation)        (Control)
```

This enables future messaging without touching core logic:
- ✅ Glassware inclusion (NOW - v1.0)
- 🔜 Free shipping thresholds (Phase 2B)
- 🔜 Loyalty points earned (Phase 2B)
- 🔜 Smart upsells (Phase 3)
- 🔜 Inventory alerts (Phase 3)

---

## 📋 Implementation Plan Highlights

### Architecture Decisions

**1. Modular Detection Pattern**
```javascript
// src/utils/subscriptionDetection.js (v1.0)
export function detectSubscription(lineItem) {
  // Returns: { isSubscription, glassCount, subscriptionType }
}

// Future additions (no core changes needed):
// src/utils/shippingThresholdDetection.js
// src/utils/upsellDetection.js
// src/utils/loyaltyPointsDetection.js
```

**Why**: Pure functions, 100% testable, infinitely extensible

**2. Component-Based Rendering**
```jsx
// src/components/GlasswareMessage.jsx (v1.0)
function GlasswareMessage({ glassCount, locale }) {
  // Handles localization, image fallback, accessibility
}

// Future additions:
// src/components/FreeShippingMessage.jsx
// src/components/UpsellMessage.jsx
```

**Why**: Isolates UI logic, enables Storybook development, supports A/B testing

**3. Orchestration Layer**
```jsx
// src/Checkout.jsx (modified in v1.0)
function Extension() {
  const lines = shopify?.lines?.value || [];
  
  return lines.map(line => {
    const subData = detectSubscription(line);
    if (subData.isSubscription) {
      return <GlasswareMessage glassCount={subData.glassCount} />;
    }
    
    // Future: Add more detectors + components here
    return null;
  });
}
```

**Why**: Clear separation of concerns, easy to add new messaging without refactoring

### Technical Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **UI Framework** | Preact JSX | API 2025-10 requirement, <3KB bundle |
| **Components** | Polaris Web (`<s-*>`) | Shopify-native, consistent styling |
| **Testing** | Vitest + @testing-library | Fast, ESM-native, Vite-compatible |
| **Localization** | shopify.i18n | Built-in, no external dependencies |
| **Extension Type** | UI Extensions (Cart + Checkout) | Line-item rendering, no manual placement |

### File Structure

```
extensions/nudun-messaging-engine/
├── src/
│   ├── Checkout.jsx              ← MODIFY (orchestration)
│   ├── components/
│   │   └── GlasswareMessage.jsx  ← NEW (presentation)
│   └── utils/
│       └── subscriptionDetection.js  ← NEW (data/logic)
│
├── __tests__/                    ← NEW (quality)
│   ├── subscriptionDetection.test.js
│   └── GlasswareMessage.test.jsx
│
└── locales/                      ← MODIFY (i18n)
    ├── en.default.json (+3 keys)
    └── fr.json (+3 keys)
```

**New Files**: 5 (2 source, 2 tests, 0 config changes)  
**Modified Files**: 4 (main extension, 2 locales, toml config)  
**Total LOC**: ~300 (detection: ~50, component: ~80, tests: ~150, docs: ~20)

---

## 🚀 Implementation Roadmap

### Task Sequence (9 Tasks, 12.5 Hours)

**Foundation Phase** (3.5 hours):
1. **TASK-001**: Detection utility (1h) → Pure function, no dependencies
2. **TASK-002**: Detection tests (1h) → 100% coverage, 12+ test cases
3. **TASK-003**: Localization keys (0.5h) → 3 keys × 2 locales

**Presentation Phase** (3.5 hours):
4. **TASK-004**: Message component (2h) → Preact JSX, image fallback, a11y
5. **TASK-005**: Component tests (1.5h) → 90%+ coverage, 8+ test cases

**Integration Phase** (5.5 hours):
6. **TASK-006**: Main extension orchestration (2h) → Line item loop + rendering
7. **TASK-007**: Extension config (0.5h) → Add line-item render targets
8. **TASK-008**: Manual E2E testing (3h) → 11 test cases in dev store
9. **TASK-009**: Documentation (1h) → README + copilot-instructions

**Parallelization Opportunities**:
- TASK-001 + TASK-003 can run in parallel (no dependencies)
- TASK-002 waits for TASK-001
- TASK-004 waits for TASK-001 + TASK-003
- Everything else is sequential

**Critical Path**: TASK-001 → TASK-002 → TASK-004 → TASK-005 → TASK-006 → TASK-007 → TASK-008 (~11 hours)

### Commit Strategy (Incremental)

Each task = 1 commit with structured message:
```
feat: Add subscription detection utility         (TASK-001)
test: Add unit tests for subscription detection  (TASK-002)
i18n: Add glassware messaging localization keys  (TASK-003)
feat: Add GlasswareMessage component             (TASK-004)
test: Add component tests for GlasswareMessage   (TASK-005)
feat: Integrate glassware messaging into checkout (TASK-006)
config: Add line-item render targets             (TASK-007)
test: Add manual testing report                  (TASK-008)
docs: Document glassware feature architecture    (TASK-009)
```

**Git History**: 9 atomic commits, easy to review/revert individually

---

## ✅ Constitutional Compliance Verification

| Principle | Requirement | Implementation | Status |
|-----------|-------------|----------------|--------|
| **I. Shopify Approval** | Optional chaining | All `shopify.*` uses `?.` | ✅ |
| | Graceful degradation | Image fallback to text-only | ✅ |
| | No @ts-ignore | Zero ignore directives | ✅ |
| | Mobile responsive | 50×50 image, flexible layout | ✅ |
| | WCAG 2.1 | Alt text, 4.5:1 contrast | ✅ |
| **II. API Version** | 2025-10 verified | `shopify.extension.toml` checked | ✅ |
| | Preact JSX pattern | `render(<Extension />)` | ✅ |
| **III. Debugging Protocol** | Test order | API → Env → Build → Code | ✅ |
| **IV. Money Objects** | N/A | No Money objects used | ✅ |
| **V. Documentation** | Inline docs | JSDoc on all functions | ✅ |
| | Update patterns | New patterns → copilot-instructions | ✅ |

**Overall Compliance**: ✅ **100% APPROVED** - All 5 principles satisfied

---

## 🎯 Success Criteria

### Technical Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Bundle size | <50KB | Webpack bundle analyzer |
| Render time | <100ms | Chrome DevTools Performance |
| Test coverage | ≥90% | Vitest coverage report |
| Accessibility score | ≥95 | Lighthouse audit |
| Build time | <5s | CLI output timing |

### Functional Metrics

| Metric | Target | Validation Method |
|--------|--------|------------------|
| Detection accuracy | 100% | Unit tests (12+ cases) |
| Localization coverage | 2 locales, 100% keys | Manual review |
| Error rate | 0 JS errors | Production monitoring |
| Mobile compatibility | 320px+ | Manual testing |

### Business Metrics (Phase 3 - Future)

- **Conversion lift**: +5% quarterly, +10% annual subscriptions
- **Support tickets**: -30% "what's included?" inquiries
- **Merchant adoption**: 80%+ enable messaging

---

## 🔍 Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Cart drawer API unsupported | 40% | High | Defer to Phase 2B, focus on checkout |
| Image CDN failure | 10% | Medium | Text-only fallback implemented |
| Keyword false positives | 15% | Low | Document requirements, add config later |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Merchant setup confusion | 30% | Medium | Onboarding guide with screenshots |
| Translation quality issues | 10% | Low | Native speaker review |

**Overall Risk Level**: 🟢 **LOW** - All risks have clear mitigations

---

## 📚 Key Learnings for Future Use Cases

### Reusable Patterns Established

**1. Detection Utility Pattern**:
```javascript
// Template for future detectors:
export function detect[Feature](data) {
  // Null safety checks
  if (!data) return { isActive: false };
  
  // Business logic
  const result = analyzeData(data);
  
  // Structured return
  return { isActive: true, ...result };
}
```

**2. Message Component Pattern**:
```jsx
// Template for future components:
function [Feature]Message({ data, locale }) {
  // Early return for inactive state
  if (!data.isActive) return null;
  
  // Localization
  const message = shopify.i18n.translate(key, vars);
  
  // Render with accessibility
  return (
    <s-block-stack>
      <s-image alt="..." />
      <s-text>{message}</s-text>
    </s-block-stack>
  );
}
```

**3. Orchestration Pattern**:
```jsx
// Add new messaging in main extension:
const featureData = detectFeature(lineItem);
if (featureData.isActive) {
  return <FeatureMessage data={featureData} />;
}
```

### Extension Points for Future Features

1. **New Detectors**: Add to `src/utils/` → Export from `detectors.js` index
2. **New Components**: Add to `src/components/` → Export from `messages.js` index
3. **New Locales**: Add `[locale].json` with same key structure
4. **New Targets**: Add `[[extensions.targeting]]` block in TOML

---

## 🔄 Next Steps

**Immediate**: Run `/speckit.tasks` to generate detailed task breakdown

**What `/speckit.tasks` will provide**:
- Detailed acceptance criteria per task
- Estimated effort in hours
- Dependency graph
- Commit message templates
- Testing checklists
- Definition of done per task

**After Tasks**: Run `/speckit.implement` to execute implementation

**Timeline**:
- Tasks generation: 30 minutes
- Implementation: 12.5 hours (~2 days)
- Code review: 2 hours
- Deployment: 1 hour
- **Total**: ~3 days end-to-end

---

## 📊 Plan Statistics

- **Pages**: 1075 lines (comprehensive coverage)
- **Sections**: 12 major phases
- **Code Examples**: 15+ (detection, components, tests, config)
- **Test Cases**: 20+ defined (12 unit, 8 component)
- **Localization Keys**: 6 total (3 English, 3 French)
- **Files Created**: 5 new files
- **Files Modified**: 4 existing files
- **Estimated LOC**: ~300 total (150 production, 150 tests)
- **Estimated Time**: 12.5 hours (~2 days)

---

**Plan Version**: 1.0.0  
**Constitutional Compliance**: ✅ 100%  
**Ready for**: `/speckit.tasks` phase  
**Git Commit**: 7d410fc

**Quick Links**:
- [Full Plan](../plans/included-glassware-plan.md)
- [Specification](../specs/included-glassware.md)
- [Constitution](../memory/constitution.md)
- [Workflow Status](../WORKFLOW-STATUS.md)
