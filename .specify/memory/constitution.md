# NUDUN Checkout Pro Constitution

## Core Principles

### I. Shopify Approval First (NON-NEGOTIABLE)
Every feature, every line of code, every API call MUST pass Shopify's app review requirements:
- Proper error handling with optional chaining (no assumptions about data availability)
- Graceful degradation when data is unavailable
- No `@ts-ignore` in production code (only in .template reference files)
- Validate all inputs and API responses
- GDPR/privacy compliance for customer data
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)

**Rationale**: Shopify approval is binary - pass or fail. Non-compliant code wastes development time and delays launch.

### II. API Version Verification (CRITICAL)
Before implementing ANY extension feature, MUST verify:
1. Check `shopify.extension.toml` for `api_version` value
2. Confirm code pattern matches API version (2025-10 = Preact JSX)
3. Verify dependencies match API requirements
4. Reference official Shopify docs for exact version

**Rationale**: Generic errors like "not a function" waste hours when root cause is API version mismatch. This principle saves 1.5-2 hours per debugging session.

### III. Extension Debugging Protocol
ALWAYS follow this order - do NOT skip steps:
1. **Verify API Version** (2 minutes) - Check config, search docs, verify pattern
2. **Verify Environment** (3 minutes) - Store, app ID, extension placement, feature flags
3. **Check Build** (2 minutes) - Compilation, dependencies, TypeScript
4. **Debug Code** (only after above passes) - Logic, data structures, null safety

**Rationale**: 75% of extension issues are environment/API version problems, not code bugs. Jumping to code debugging wastes time.

### IV. Money Object Pattern (DATA STRUCTURE)
All Shopify Money objects MUST be accessed correctly:
- `shopify.cost.totalAmount.value` returns `{ amount: string, currencyCode: string }`
- Extract `amount` and `currencyCode` properties separately
- Never treat Money objects as plain numbers
- Always use optional chaining when accessing

**Rationale**: Shopify's Money objects have specific structure. Incorrect access shows "[object Object]" and wastes debugging time.

### V. Documentation-Driven Development
Before writing code:
1. Check `.github/copilot-instructions.md` for patterns
2. Reference `SHOPIFY-APPROVAL-CHECKLIST.md` for compliance
3. Keep `QUICK-REFERENCE.md` visible while coding
4. Document new patterns discovered

**Rationale**: Documented patterns prevent repeating mistakes and ensure consistency across features.

## Technical Constraints

**Technology Stack** (NON-NEGOTIABLE):
- **Admin App**: React Router 7 + Shopify App Bridge + Polaris Web Components
- **Extensions**: Preact JSX (API 2025-10) + Shopify UI Extensions
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Language**: TypeScript with strict mode

**Performance Requirements**:
- Extension load time: <100ms
- API response time: <200ms
- Bundle size: <500KB per extension
- Lighthouse score: >90 for admin app

**Security Requirements**:
- All API endpoints require authentication
- Customer data encrypted in transit and at rest
- GDPR-compliant data handling
- Webhook signature verification mandatory

## Development Workflow

**Feature Development Process**:
1. Use `/speckit.specify` to define feature requirements
2. Use `/speckit.plan` to create technical implementation plan
3. Use `/speckit.tasks` to break down into actionable tasks
4. Review SHOPIFY-APPROVAL-CHECKLIST.md before implementation
5. Use `/speckit.implement` to execute tasks
6. Test on mobile and verify accessibility

**Quality Gates** (MUST PASS):
- [ ] Shopify approval checklist complete
- [ ] Extension debugging protocol followed
- [ ] Money objects accessed correctly
- [ ] TypeScript compiles with no errors
- [ ] Tests pass (when tests exist)
- [ ] Mobile responsive verified
- [ ] Accessibility checked

**Code Review Requirements**:
- All PRs must reference related spec/plan/tasks
- Changes must comply with all core principles
- Non-compliance must be explicitly justified
- Complex code requires inline documentation

## Governance

**Authority**: This constitution supersedes all other development practices and coding guidelines. When in conflict, constitution principles win.

**Amendment Process**:
1. Proposed change documented with rationale
2. Review impact on existing code/patterns
3. Update templates and documentation
4. Version bump according to semantic versioning
5. Communicate changes to team

**Compliance**:
- All features must demonstrate constitutional compliance
- Violations require explicit justification in PR
- Unjustified violations block approval
- Constitution review required before major features

**Semantic Versioning**:
- MAJOR: Backward incompatible principle changes
- MINOR: New principles or expanded guidance
- PATCH: Clarifications, typo fixes, non-semantic changes

**Runtime Guidance**: For day-to-day development, refer to:
- `.github/copilot-instructions.md` - Detailed patterns and examples
- `SHOPIFY-APPROVAL-CHECKLIST.md` - Compliance requirements
- `QUICK-REFERENCE.md` - Daily coding standards
- `docs/reference/MONEY-OBJECT-PATTERN.md` - Data structure patterns

**Version**: 1.0.0 | **Ratified**: 2025-10-07 | **Last Amended**: 2025-10-07