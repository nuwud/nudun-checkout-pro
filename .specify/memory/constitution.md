# NUDUN Checkout Pro Constitution

## Core Principles

### I. Shopify Approval Compliance (Non-Negotiable)
Every code path must satisfy Shopify's app review checklist. Use optional chaining with graceful fallbacks, never ship `@ts-ignore` outside template files, and prefer defensive error handling over optimistic assumptions. Block merges that introduce unhandled promise rejections, missing null guards, or customer-data exposure.

### II. Checkout Extension Integrity
Checkout UI extensions must target API 2025-10, use the Preact `render(<Extension />, document.body)` pattern, and rely on Polaris web components (`<s-*>`). All Money objects are accessed via `.amount` and `.currencyCode`, and business logic stays framework-agnostic to keep bundle size under 100 KB.

### III. Documentation-Driven Delivery
Specifications, plans, and merchant guides are first-class artifacts. No feature is complete without updated documentation in `docs/`, localized copy in `locales/`, and an entry in the implementation status log. Regenerate or edit reference guides whenever behavior changes.

### IV. Verification & Observability
Adopt test-first habits for utilities and detectors, add console or analytics logging only behind debug toggles, and confirm each Shopify workflow with screenshots or GIFs stored under `docs/`. Any configuration change must include validation steps in the testing guides.

### V. Privacy & Configuration Ownership
Customer data is processed with privacy-by-design: no PII leaves Shopify, and analytics events must scrub identifiers. Merchant-facing toggles drive runtime behavior—hard-coded thresholds or copy are forbidden when a configurable alternative exists.

## Implementation Constraints

- **Technology**: React Router 7 admin app, Prisma for persistence, Preact checkout extensions, Vitest for new tests.
- **Performance**: Checkout render under 100 ms, extension bundle < 80 KB gzip, API responses < 200 ms.
- **Localization**: Maintain English and French keys; new features require translation placeholders before merge.
- **Security**: Authenticate via `authenticate.admin()` for admin routes, verify webhook signatures, and encrypt secrets in storage.

## Development Workflow

1. Run `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` before implementation; `/speckit.implement` only after manual review of artifacts.
2. Create feature branches named `NNN-feature-name`; link work to corresponding spec directory.
3. Record QA evidence in the relevant testing guide (`TESTING-*.md`) and update `IMPLEMENTATION-STATUS.md` with completion notes.
4. Prioritize merchant experience: verify admin UI, Shopify customizer, and live checkout flows for each change.

## Governance

- This constitution supersedes ad-hoc preferences. Conflicts must be escalated via PR discussion and resolved by updating this document.
- Amendments require: consensus with product owner, documented rationale, version bump, and PR review.
- Reviewers enforce constitutional checks before approving; missing documentation or tests are grounds for rejection.

**Version**: 1.0.0 | **Ratified**: 2025-10-19 | **Last Amended**: 2025-10-19
