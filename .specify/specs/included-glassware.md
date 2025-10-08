# Feature Specification: Included Glassware Messaging

**Feature Branch**: `feature/included-glassware`  
**Created**: 2025-10-07  
**Status**: Draft  
**Target Release**: Phase 2A - Dynamic Messaging Engine  
**Constitutional Compliance**: ✅ Verified against v1.0.0

## User Scenarios & Testing *(mandatory)*

<!--
  User stories PRIORITIZED as independently testable journeys.
  Each story delivers standalone MVP value and can be developed/tested/deployed independently.
-->

### User Story 1 - Quarterly Subscriber Sees Glass Inclusion (Priority: P1)

Customer adding a quarterly subscription to their cart immediately sees clear messaging that they'll receive 1 premium glass included with their order, building confidence in the subscription value.

**Why this priority**: This is the primary use case (quarterly subscriptions are most common), and seeing the glass inclusion is a key conversion driver. Without this, customers may not realize the subscription benefit.

**Independent Test**: Add quarterly subscription to cart → verify "Includes **1** premium glass" message appears with glass image in both cart and checkout.

**Acceptance Scenarios**:

1. **Given** customer is on product page with quarterly subscription option, **When** they add quarterly subscription to cart, **Then** cart drawer displays glass image + "Includes **1** premium glass" text
2. **Given** customer has quarterly subscription in cart, **When** they proceed to checkout, **Then** checkout displays same glass image + text below the subscription line item
3. **Given** customer has quarterly subscription in cart, **When** they increase quantity to 2, **Then** message still shows "Includes **1** premium glass" (not 2 glasses - one glass per subscription, not per unit)
4. **Given** customer views cart on mobile device, **When** glassware message displays, **Then** image is 50×50px, text is readable, and layout doesn't break
5. **Given** customer has non-subscription products in cart, **When** they view cart, **Then** NO glassware messaging appears for non-subscription items

---

### User Story 2 - Annual Subscriber Sees Enhanced Glass Inclusion (Priority: P2)

Customer selecting an annual subscription sees they'll receive 4 premium glasses (one per quarter), emphasizing the higher-tier subscription's enhanced value proposition.

**Why this priority**: Annual subscriptions have higher LTV but lower conversion. Clear glass messaging (4× the value) helps justify the annual commitment and increases annual subscription conversion rate.

**Independent Test**: Add annual subscription to cart → verify "Includes **4** premium glasses" message appears with glass image in both cart and checkout.

**Acceptance Scenarios**:

1. **Given** customer adds annual subscription to cart, **When** cart drawer opens, **Then** displays glass image + "Includes **4** premium glasses" (plural)
2. **Given** customer proceeds to checkout with annual subscription, **When** checkout page loads, **Then** shows same "Includes **4** premium glasses" below line item
3. **Given** customer has both quarterly and annual subscriptions, **When** viewing cart, **Then** quarterly shows "1 glass", annual shows "4 glasses" (independent messaging per subscription type)
4. **Given** customer switches from annual to quarterly variant, **When** variant updates, **Then** message dynamically updates from "4 glasses" to "1 glass" without page reload

---

### User Story 3 - International Customer Sees Localized Messaging (Priority: P3)

French-Canadian customer viewing cart with subscription sees glassware messaging in French ("Comprend **1** verre premium" / "Comprend **4** verres premium"), maintaining professional brand experience across locales.

**Why this priority**: Localization increases trust and conversion for international markets. While P3, it's required for Shopify approval (internationalization requirement).

**Independent Test**: Set browser/account locale to French → add subscription → verify French translation appears.

**Acceptance Scenarios**:

1. **Given** customer's locale is French (fr-CA), **When** quarterly subscription added to cart, **Then** displays "Comprend **1** verre premium"
2. **Given** customer's locale is French (fr-CA), **When** annual subscription added to cart, **Then** displays "Comprend **4** verres premium"
3. **Given** customer's locale is unsupported (e.g., Japanese), **When** subscription added, **Then** displays English fallback text
4. **Given** customer changes locale mid-session, **When** viewing cart, **Then** glassware messaging updates to new locale without refresh

---

### User Story 4 - Accessibility Compliance for Screen Readers (Priority: P3)

Customer using screen reader navigates checkout with subscription and hears clear announcement: "Premium glass included" alt text followed by "Includes 1 premium glass" text, ensuring equal access to subscription benefits.

**Why this priority**: Required for Shopify approval (WCAG 2.1 compliance). While P3 for feature launch, it's NON-NEGOTIABLE for app review.

**Independent Test**: Use NVDA/JAWS screen reader → add subscription → verify image alt text and message text are announced correctly.

**Acceptance Scenarios**:

1. **Given** screen reader active, **When** navigating to subscription line item with glassware message, **Then** image announces "Premium glass included" alt text
2. **Given** screen reader active, **When** continuing to text component, **Then** announces "Includes 1 premium glass" or "Includes 4 premium glasses"
3. **Given** customer using keyboard navigation, **When** tabbing through checkout, **Then** glassware message is in logical tab order
4. **Given** customer using high contrast mode, **When** viewing glassware message, **Then** text maintains sufficient contrast ratio (4.5:1 minimum)

---

### Edge Cases

- **What happens when subscription title doesn't contain keywords?** → No message displayed (graceful degradation). Log warning to help merchants update product titles.
- **What happens when glass image URL returns 404?** → Show placeholder icon (fallback) or hide image component (text-only message). Never break UI.
- **What happens when customer has 10 subscriptions in cart?** → Each subscription independently shows appropriate glass count. Performance must remain <100ms render time.
- **What happens when Shopify API doesn't return line items?** → Component renders nothing (safe null handling). No error thrown.
- **What happens when customer applies discount code?** → Glassware message remains visible (discounts don't affect included glass benefit).
- **What happens when merchant changes product title mid-session?** → Detection logic uses current title; message updates on next cart modification.
- **What happens when checkout language differs from storefront language?** → Use checkout locale (shopify.localization.value.isoCode), not storefront locale.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect subscription products by scanning line item titles for keywords: "quarterly", "annual", "subscription" (case-insensitive)
- **FR-002**: System MUST calculate included glass count: Quarterly = 1 glass, Annual = 4 glasses
- **FR-003**: System MUST render glassware message in cart drawer using Shopify Cart UI Extensions API (target: `purchase.cart.line-item.render-after`)
- **FR-004**: System MUST render glassware message in checkout using Shopify Checkout UI Extensions API 2025-10 with Preact (target: `purchase.checkout.cart-line-item.render-after`)
- **FR-005**: System MUST display 50×50px glass image with URL: `https://cdn.shopify.com/s/files/1/0729/7633/5021/files/Single-Glass.jpg?v=1759894128`
- **FR-006**: System MUST display text "Includes **X** premium glass" (singular) or "Includes **X** premium glasses" (plural) with bold count
- **FR-007**: System MUST update message dynamically when cart changes (quantity, variant, removal) without page reload
- **FR-008**: System MUST use optional chaining for all Shopify data access (comply with Constitution Principle I - Shopify Approval)
- **FR-009**: System MUST provide graceful degradation when image fails to load (show text-only or placeholder icon)
- **FR-010**: System MUST support localization via shopify.i18n.translate() with keys: `subscriptionIncludesGlass` (singular), `subscriptionIncludesGlasses` (plural)
- **FR-011**: System MUST provide image alt text "Premium glass included" for accessibility (WCAG 2.1 compliance)
- **FR-012**: System MUST NOT display glassware message for non-subscription products
- **FR-013**: System MUST calculate glass count per subscription type, NOT per quantity (1 subscription × 5 quantity = still 1 or 4 glasses, not 5 or 20)
- **FR-014**: System MUST maintain <100ms render time for glassware components (Constitution - Performance Requirements)
- **FR-015**: System MUST ensure color contrast ratio ≥4.5:1 for text (WCAG 2.1 Level AA)

*Clarifications needed:*

- **FR-016**: System MUST handle custom subscription product titles [NEEDS CLARIFICATION: Should detection support merchant-configurable keywords or regex patterns? Currently hardcoded to "quarterly"/"annual"/"subscription"]
- **FR-017**: System MUST track analytics for glassware message impressions [NEEDS CLARIFICATION: Should impressions fire analytics events? Which platform (GA4, Segment, Shopify Analytics)?]

### Key Entities

- **Subscription Line Item**: Cart or checkout line item containing subscription metadata
  - Attributes: `title` (string), `quantity` (number), `sellingPlan` (optional SellingPlan object)
  - Detection: Title contains "quarterly" OR "annual" OR "subscription"
  - Glass Count: Derived from title keywords (quarterly=1, annual=4, default=0)

- **Glassware Message Component**: UI component displaying glass image + text
  - Attributes: `glassCount` (number), `imageUrl` (string), `altText` (string), `locale` (string)
  - Rendering: BlockStack container with Image + Text children
  - Targets: Cart drawer (`purchase.cart.line-item.render-after`) and Checkout (`purchase.checkout.cart-line-item.render-after`)

- **Localization Key**: Translation strings for i18n
  - Keys: `subscriptionIncludesGlass` (singular), `subscriptionIncludesGlasses` (plural)
  - Format: "Includes **{count}** premium glass|glasses"
  - Locales: en.default.json (English), fr.json (French), [expand as needed]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers with quarterly subscriptions see "Includes **1** premium glass" message in both cart and checkout within <100ms of adding product
- **SC-002**: Customers with annual subscriptions see "Includes **4** premium glasses" message in both cart and checkout within <100ms of adding product
- **SC-003**: 100% of screen reader users can access glassware information via alt text and readable message text (verified with NVDA/JAWS testing)
- **SC-004**: Glassware messaging displays correctly on mobile devices (320px width minimum) without layout breakage or text truncation
- **SC-005**: System gracefully handles missing data (null line items, missing titles, failed image loads) with zero JavaScript errors or blank screens
- **SC-006**: Localized messaging displays for French-Canadian customers with 100% accuracy (verified manual testing)
- **SC-007**: Glass count updates dynamically when customer changes subscription variant (quarterly ↔ annual) without page reload or flicker
- **SC-008**: Non-subscription products show zero glassware messaging (verified with cart containing mixed subscription + non-subscription items)
- **SC-009**: Merchants can review Included Glassware implementation and verify it passes Shopify app review requirements (checklist compliance ≥95%)
- **SC-010**: Extension bundle size remains <50KB (maintaining Constitution - Performance Requirements)

### Business Impact (Secondary)

- **Increase quarterly subscription conversion rate** by making glass inclusion explicit (target: +5% conversion lift)
- **Increase annual subscription conversion rate** by emphasizing 4× glass value (target: +10% conversion lift over quarterly)
- **Reduce "what's included?" support tickets** related to subscription benefits (target: -30% tickets)
- **Improve customer satisfaction** with subscription transparency (target: +0.5 NPS points)

## Technical Context *(informative)*

### Relevant Constitution Principles

- **Principle I (Shopify Approval First)**: This feature requires optional chaining for all `shopify` global access, graceful image fallback, mobile responsiveness, and WCAG 2.1 compliance.
- **Principle II (API Version Verification)**: Must use Preact JSX pattern with API 2025-10 for checkout extension.
- **Principle III (Extension Debugging Protocol)**: Testing must verify API version, environment setup, build, then code logic (in that order).
- **Principle IV (Money Object Pattern)**: Not directly applicable (no Money objects in this feature), but demonstrates proper Shopify data structure handling patterns.

### Existing Project Resources

- **Extension Workspace**: `extensions/nudun-messaging-engine/` - existing checkout extension (can extend or create new extension)
- **Localization Files**: `extensions/nudun-messaging-engine/locales/en.default.json`, `fr.json` - add new keys here
- **Shopify Extension Config**: `extensions/nudun-messaging-engine/shopify.extension.toml` - update targets if needed
- **Polaris Components**: Use `<s-block-stack>`, `<s-image>`, `<s-text>` web components (NOT React components)

### Dependencies

- Preact (already installed for checkout extensions)
- @shopify/ui-extensions (already installed)
- shopify.lines.value (reactive cart data)
- shopify.i18n.translate() (localization API)
- shopify.localization.value.isoCode (locale detection)

## Risks & Mitigations

### Technical Risks

**RISK-001: Image CDN Failure (Medium)**  
- **Impact**: Glass image doesn't load, breaking visual communication
- **Mitigation**: Implement fallback placeholder icon or text-only mode; test with network throttling; consider hosting image in app's public assets
- **Detection**: Monitor image load errors; alert if >5% failure rate

**RISK-002: Subscription Keyword Detection False Positives/Negatives (Medium)**  
- **Impact**: Non-subscription products show messaging OR subscription products don't
- **Mitigation**: Comprehensive test coverage with edge case product titles; consider additional detection via `sellingPlan` metadata; document keyword requirements for merchants
- **Detection**: Unit tests verify detection logic; manual QA with diverse product titles

**RISK-003: Performance Degradation with Large Carts (Low)**  
- **Impact**: Rendering 10+ glassware messages slows checkout
- **Mitigation**: Optimize rendering with React.memo/Preact signals; lazy-load images; test with 20+ line item carts
- **Detection**: Performance testing with large cart sizes; Lighthouse score monitoring

**RISK-004: Localization Key Missing for New Locale (Low)**  
- **Impact**: Messaging shows English fallback for unsupported locales (not breaking, but suboptimal UX)
- **Mitigation**: Document locale expansion process; provide fallback to `en.default.json`; track locale usage analytics
- **Detection**: Locale coverage report; merchant feedback

### Business Risks

**RISK-005: Merchant Confusion About Glass Inclusion Logic (Medium)**  
- **Impact**: Merchants may ask "How does the app know which products include glasses?"
- **Mitigation**: Clear documentation in app admin dashboard; onboarding guide; FAQ section; consider merchant-configurable keyword settings in future
- **Detection**: Support ticket volume; merchant feedback surveys

**RISK-006: Glass Image URL Changes Without Notice (Low)**  
- **Impact**: Image breaks if merchant updates CDN file or URL structure changes
- **Mitigation**: Document image URL as configuration; consider making it configurable in app settings; monitor image load success rate
- **Detection**: Automated image availability check; error logging

## Open Questions

1. **Should glass count be configurable per product?** (Currently hardcoded: quarterly=1, annual=4)  
   → Suggested resolution: Start with hardcoded logic for MVP; add merchant configuration in Phase 2B if needed

2. **Should detection use `sellingPlan` metadata instead of/in addition to title keywords?**  
   → Suggested resolution: Use title keywords as primary (simple, immediate value); consider `sellingPlan` as enhancement in future iteration

3. **Should we fire analytics events for glassware message impressions?**  
   → Suggested resolution: Yes, but defer to Phase 3 (Analytics & Tracking) to avoid scope creep

4. **Should image URL be merchant-configurable?**  
   → Suggested resolution: Hardcode for MVP; add to merchant configuration dashboard in Phase 2B if feedback indicates need

5. **Should we support custom subscription intervals beyond quarterly/annual?** (e.g., monthly, biannual)  
   → Suggested resolution: Start with quarterly/annual only; extend detection logic if merchants request additional intervals

## Next Steps

After specification approval:

1. **Run `/speckit.plan`** to generate technical implementation plan with chosen tech stack
2. **Review plan against SHOPIFY-APPROVAL-CHECKLIST.md** for compliance
3. **Run `/speckit.tasks`** to break down into actionable, reviewable tasks
4. **Create feature branch**: `feature/included-glassware`
5. **Run `/speckit.implement`** to execute tasks following quality gates

## Reviewer Notes

**Critical Verification Points**:

- [ ] **Image URL Accuracy**: Verify `https://cdn.shopify.com/s/files/1/0729/7633/5021/files/Single-Glass.jpg?v=1759894128` loads correctly in production Shopify CDN
- [ ] **Localization Keys**: Confirm `subscriptionIncludesGlass` and `subscriptionIncludesGlasses` keys follow project i18n conventions
- [ ] **Extension Target Placement**: Verify `purchase.checkout.cart-line-item.render-after` is correct target for checkout (vs. other placement options)
- [ ] **Cart Drawer API Support**: Confirm Cart UI Extensions API supports `purchase.cart.line-item.render-after` target (or equivalent)
- [ ] **Keyword Case Sensitivity**: Verify detection should be case-insensitive (current spec says yes)
- [ ] **Quantity Independence**: Confirm glass count should NOT multiply by line item quantity (spec says correct: 1 subscription × 5 qty = still 1 glass, not 5)
- [ ] **Constitution Compliance**: All requirements align with Shopify Approval checklist, API version requirements, and debugging protocol

**Scope Boundaries**:

- **IN SCOPE**: Detection, rendering, localization, accessibility, mobile responsiveness
- **OUT OF SCOPE**: Analytics tracking (Phase 3), merchant configuration UI (Phase 2B), custom subscription intervals beyond quarterly/annual
- **DEFERRED**: A/B testing different glass image variations (Phase 5)

---

**Constitutional Compliance Check**: ✅ PASSED  
- Shopify Approval: Optional chaining, graceful degradation, accessibility, mobile-first ✅  
- API Version: Preact JSX pattern specified for 2025-10 ✅  
- Debugging Protocol: Test plan follows environment → build → code order ✅  
- Documentation: Comprehensive spec with acceptance criteria ✅  

**Specification Version**: 1.0.0  
**Next Review Date**: 2025-10-14 (or upon implementation plan completion)
