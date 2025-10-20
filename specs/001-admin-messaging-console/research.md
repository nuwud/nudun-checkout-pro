# Research: Admin Messaging Console

_Last updated: 2025-10-19_

## Objectives
- Understand Shopify embedded admin constraints for configuring checkout messaging.
- Identify Polaris web component patterns that suit threshold and upsell management.
- Clarify integration points between admin console, Prisma persistence, and checkout extension.
- Capture localization, accessibility, and security considerations required for Shopify app approval.

## Findings

### Shopify Embedded App Environment
- Must call `authenticate.admin()` in every loader/action to enforce session validation and App Bridge headers.
- Navigation must use `<s-link>` or React Router helpers; avoid bare `<a>` tags to keep iframe session intact.
- App Bridge toasts are standard for save success/error feedback; accessible alternative text required.
- CSRF handled via React Router forms; ensure actions call `await authenticate.admin(request)` before touching payloads.

### Polaris Web Components (2025-10)
- Use `<s-page>`, `<s-layout>`, `<s-card>`, and `<s-banner>` for primary admin console layout.
- Form inputs: `<s-text-field>`, `<s-select>`, `<s-number-field>` (with min/max) for threshold amounts; `<s-checkbox>` for toggles.
- Use `<s-inline-stack>` and `<s-block-stack>` to organize editors without custom CSS where possible.
- Validation messaging via `<s-inline-error>` tied to `control-id` attribute.

### Localization & Content Strategy
- All merchant-facing strings require `en` and `fr` entries upfront; store string keys in `docs/user-guides/admin-console.md` for translation tracking.
- Money values should use Shopify `shopLocale` utility or custom formatter respecting currency code from shop session.
- Avoid hardcoded currency symbols; use `Intl.NumberFormat` with locale from session.

### Data Source & Persistence
- Prisma currently stores sessions only. Messaging console introduces configuration tables with 1:many relationship for thresholds/upsells.
- Need audit log to capture actor (`shop`, `staffAccountId`), action, diff snapshot for compliance (Shopify review requirement for significant configuration changes).
- SQLite dev DB supports JSON columns via `Json` type; for portability, store thresholds as discrete rows instead of JSON blob.

### Checkout Extension Integration
- Extension uses Preact with `shopify` global; must fetch merchant settings via HTTPS endpoint on admin app domain.
- Shopify recommends caching extension GET responses with `Cache-Control: max-age=60, stale-while-revalidate=300` to avoid performance hits.
- Fallback strategy: if fetch fails, extension should load default thresholds (e.g., previously bundled config) and surface subtle banner in admin console indicating stale state.

### Security & Privacy
- No customer PII stored; configs limited to merchant-authored copy and numeric thresholds.
- Audit log should omit end-customer information entirely.
- All API responses must sanitize HTML (no raw HTML injection) to prevent stored XSS when merchants save copy.
- Rate limit admin actions server-side (max 10 writes/min per shop) using simple in-memory throttling or Prisma count check.

### Accessibility Expectations
- Components must support keyboard navigation (tab order, ARIA labels for toggles).
- Preview pane should include `title` attribute and alt text for screenshots.
- Provide status messages announcing saves via `aria-live="polite"` region.

## Open Questions (for Stakeholders)
1. Should console support role-based restrictions (e.g., limit to users with specific Shopify store permissions)?
2. Preferred preview experience: live checkout iframe or generated snapshot service?
3. Do merchants need per-locale copy editing beyond `en`/`fr`? If yes, extend model to support arbitrary locales.
4. Should audit export integrate with external analytics (Segment, GA4)?

## References
- Shopify App Bridge + React Router integration guide (2025-10).
- Polaris Web Components documentation: layout, forms, feedback patterns.
- Internal `docs/architecture/embedded-app.md` for iframe session best practices.
