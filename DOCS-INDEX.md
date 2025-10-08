# Docu## ⚠️ START HERE: Shopify Approval Requirements

**MUST READ FIRST**: Before writing any code:
1. **SHOPIFY-APPR├── docs/                         # Documentation
│   ├── reference/               # Technical reference docs
│   │   ├── CHECKOUT-EXTENSION-SETUP.md
│   │   ├── EXTENSION-QUICK-REF.md
│   │   ├── IMPLEMENTATION-GUIDE.md
│   │   ├── MONEY-OBJECT-PATTERN.md
│   │   ├── NUDUN-STORE-CONFIG.md
│   │   ├── ROADMAP-COMPLETE.md
│   │   ├── SHOPIFY-COMPLIANCE-UPDATE.md
│   │   └── SPEC-KIT.md
│   ├── troubleshooting/         # Troubleshooting guides
│   │   └── DEBUG-EXTENSION-NOT-SHOWING.md
│   ├── session-notes/           # Historical development notes
│   │   ├── old_copilot-instructions.md
│   │   ├── SESSION-SUMMARY-MONEY-OBJECT.md
│   │   └── SUCCESS-SUMMARY.md
│   ├── api/                     # API documentation (future)
│   ├── architecture/            # Architecture docs (future)
│   └── user-guides/             # End-user guides (future)
│
├── .github/
│   └── copilot-instructions.md  # AI agent guidelines (compliance-focused)
│
├── README.md                    # Main readme
├── DOCS-INDEX.md                # Documentation navigation (this file)
├── SHOPIFY-APPROVAL-CHECKLIST.md # 🚨 CRITICAL: Compliance requirements
└── QUICK-REFERENCE.md           # Daily development quick reference - Complete compliance requirements (root)
2. **QUICK-REFERENCE.md** - Daily development quick reference (root)
3. **docs/reference/SHOPIFY-COMPLIANCE-UPDATE.md** - What we changed and why

These documents ensure every line of code will pass Shopify's app review.n Index

**Your complete guide to NUDUN Checkout Pro documentation**

---

## ��� START HERE: Shopify Approval Requirements

**MUST READ FIRST**: Before writing any code:
1. **SHOPIFY-APPROVAL-CHECKLIST.md** - Complete compliance requirements
2. **QUICK-REFERENCE.md** - Daily development quick reference
3. **SHOPIFY-COMPLIANCE-UPDATE.md** - What we changed and why

These documents ensure every line of code will pass Shopify's app review.

---

## What to Read When

### "I'm new to this project"
1. Start with **README.md**
2. Read **SHOPIFY-APPROVAL-CHECKLIST.md** (CRITICAL)
3. Review **docs/session-notes/SUCCESS-SUMMARY.md** to understand current state
4. Check **.github/copilot-instructions.md** for patterns

### "I'm building a feature"
1. **ALWAYS** check **SHOPIFY-APPROVAL-CHECKLIST.md** first
2. Keep **QUICK-REFERENCE.md** visible while coding
3. Check **docs/reference/IMPLEMENTATION-GUIDE.md** for the roadmap
4. Reference **docs/reference/EXTENSION-QUICK-REF.md** for code patterns
5. Use **extensions/nudun-messaging-engine/src/Checkout.template.jsx** for examples

### "Extension isn't working"
1. Check **docs/troubleshooting/DEBUG-EXTENSION-NOT-SHOWING.md** first
2. Verify config in **docs/reference/NUDUN-STORE-CONFIG.md**
3. Review **docs/reference/CHECKOUT-EXTENSION-SETUP.md**
4. Check **docs/session-notes/SUCCESS-SUMMARY.md** for working patterns

### "I need to understand the architecture"
1. Read **docs/reference/SPEC-KIT.md** for high-level decisions
2. Check **.github/copilot-instructions.md** for patterns
3. Review **docs/reference/IMPLEMENTATION-GUIDE.md** for data models
4. Check **SHOPIFY-APPROVAL-CHECKLIST.md** for security requirements

---

## All Documentation Files

### 📋 Compliance & Approval (READ FIRST)
| File | Location | Purpose | When to Use |
|------|----------|---------|-------------|
| **SHOPIFY-APPROVAL-CHECKLIST.md** | Root | Complete compliance requirements | Before every feature, before every commit |
| **QUICK-REFERENCE.md** | Root | Daily development quick reference | Keep visible while coding |
| **SHOPIFY-COMPLIANCE-UPDATE.md** | docs/reference/ | Summary of compliance changes | Understanding what changed and why |

### 📚 Core Documentation
| File | Location | Purpose | When to Use |
|------|----------|---------|-------------|
| **README.md** | Root | Project overview and quick start | First time setup, overview |
| **copilot-instructions.md** | .github/ | AI agent development guide | Understanding patterns, troubleshooting |
| **SPEC-KIT.md** | docs/reference/ | Technical specifications | Architecture decisions, tech stack |
| **IMPLEMENTATION-GUIDE.md** | docs/reference/ | Feature roadmap and data models | Planning features, database design |
| **ROADMAP-COMPLETE.md** | docs/reference/ | Complete feature roadmap | Understanding all planned features |
| **MONEY-OBJECT-PATTERN.md** | docs/reference/ | Money object handling guide | Working with Shopify Money objects |

### 🛠️ Development Guides
| File | Location | Purpose | When to Use |
|------|----------|---------|-------------|
| **EXTENSION-QUICK-REF.md** | docs/reference/ | Code patterns for extensions | Building checkout UI features |
| **Checkout.template.jsx** | extensions/.../src/ | Example extension code | Copy-paste starting point |
| **CHECKOUT-EXTENSION-SETUP.md** | docs/reference/ | Extension configuration guide | Setting up new extensions |

### 🔧 Troubleshooting
| File | Location | Purpose | When to Use |
|------|----------|---------|-------------|
| **DEBUG-EXTENSION-NOT-SHOWING.md** | docs/troubleshooting/ | Extension troubleshooting | Extension not rendering |
| **NUDUN-STORE-CONFIG.md** | docs/reference/ | Store configuration details | Verifying store setup |

### 📝 Session Notes (Historical Reference)
| File | Location | Purpose |
|------|----------|---------|
| **SUCCESS-SUMMARY.md** | docs/session-notes/ | Initial success breakthrough |
| **SESSION-SUMMARY-MONEY-OBJECT.md** | docs/session-notes/ | Money object debugging session |
| **old_copilot-instructions.md** | docs/session-notes/ | Previous version for reference |

---

## Project Structure

```
nudun-checkout-pro/
├── app/                          # Main Shopify app (React Router 7)
│   ├── routes/                   # Admin UI routes
│   │   ├── app._index.tsx       # Dashboard
│   │   ├── app.additional.tsx   # Additional page example
│   │   └── webhooks.*           # Webhook handlers
│   ├── shopify.server.ts        # Shopify configuration
│   └── db.server.ts             # Database client
│
├── extensions/                   # Checkout UI extensions
│   └── nudun-messaging-engine/
│       ├── src/
│       │   ├── Checkout.jsx     # Main extension (PRODUCTION ✅)
│       │   └── Checkout.template.jsx  # Reference examples
│       ├── shopify.extension.toml    # Extension config
│       └── package.json         # Extension dependencies
│
├── prisma/                       # Database
│   ├── schema.prisma            # Data models
│   └── migrations/              # Migration history
│
├── docs/                         # Documentation (your custom docs)
│   ├── api/
│   ├── architecture/
│   └── user-guides/
│
├── .github/
│   └── copilot-instructions.md  # AI agent guidelines (compliance-focused)
│
├── README.md                    # Main readme
├── SHOPIFY-APPROVAL-CHECKLIST.md # ��� CRITICAL: Compliance requirements
├── QUICK-REFERENCE.md           # Daily development quick reference
├── SHOPIFY-COMPLIANCE-UPDATE.md # Summary of compliance changes
├── SPEC-KIT.md                  # Technical specs
├── IMPLEMENTATION-GUIDE.md      # Feature roadmap
├── EXTENSION-QUICK-REF.md       # Code patterns
├── SUCCESS-SUMMARY.md           # Today's accomplishments
├── CHECKOUT-EXTENSION-SETUP.md  # Setup guide
├── DEBUG-EXTENSION-NOT-SHOWING.md  # Troubleshooting
└── NUDUN-STORE-CONFIG.md        # Store configuration
```

---

## Key Files Explained

### App Configuration
- **shopify.app.toml** - App metadata, scopes, webhooks
- **shopify.app.nudun-checkout-pro.toml** - Environment-specific overrides
- **vite.config.ts** - Dev server and build configuration
- **.graphqlrc.ts** - GraphQL tooling config

### Extension Configuration
- **extensions/nudun-messaging-engine/shopify.extension.toml** - Extension settings (API 2025-10)
- **extensions/nudun-messaging-engine/package.json** - Preact dependencies
- **extensions/nudun-messaging-engine/tsconfig.json** - TypeScript config

### Database
- **prisma/schema.prisma** - Data models (Session table currently)
- **app/db.server.ts** - Prisma client singleton

### Development
- **package.json** - Main dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **.eslintrc.cjs** - Linting rules

---

## Core Concepts

### 1. Extension Architecture (2025-10 API)
- Uses **Preact with JSX** (not vanilla JS, not React)
- Renders with `render(<Component />, document.body)`
- JSX syntax with `<s-*>` Polaris web components
- Access checkout data via global `shopify` object
- **MUST use optional chaining** for Shopify approval

### 2. App Architecture
- **Admin App**: React Router 7 + Polaris Web Components
- **Extensions**: Preact + Shopify UI Extensions API 2025-10
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Authentication**: Shopify App Bridge + Session Tokens

### 3. Development Workflow
```bash
npm run dev          # Start dev server with tunnel
npm run build        # Production build
npm run setup        # Database setup
npm run typecheck    # Type checking
```

### 4. Extension Workflow
1. Edit `extensions/nudun-messaging-engine/src/Checkout.jsx`
2. Extension auto-rebuilds on save
3. Refresh checkout editor to see changes
4. Drag extension into checkout layout
5. Save and test in checkout preview

### 5. Shopify Approval Workflow
1. **Before coding**: Read `SHOPIFY-APPROVAL-CHECKLIST.md`
2. **While coding**: Keep `QUICK-REFERENCE.md` visible
3. **Before committing**: Run through checklist
4. **Before features**: Review compliance patterns
5. **Before submission**: Complete full audit

---

## Feature Implementation Status

### ✅ Phase 1: Foundation (COMPLETE)
- [x] App scaffolding with React Router 7
- [x] Extension rendering with Preact JSX
- [x] Store connection (nudun-dev-store)
- [x] Dev environment operational
- [x] Comprehensive documentation
- [x] Shopify approval compliance baseline

### ��� Phase 2: Core Messaging (NEXT)
- [ ] Rule builder UI (with validation)
- [ ] Rule evaluation engine
- [ ] Message rendering in checkout
- [ ] Cart analysis utilities
- [ ] Merchant API endpoints
- [ ] Error handling throughout

### ��� Phase 3: Intelligence Features
- [ ] Subscription detection
- [ ] Product recommendations
- [ ] Customer segmentation
- [ ] Smart upsells
- [ ] A/B testing for messages

### ��� Phase 4: Analytics & Tracking
- [ ] Event tracking (with privacy compliance)
- [ ] Analytics dashboard
- [ ] Conversion funnels
- [ ] Export/reporting
- [ ] GDPR data deletion

### ��� Phase 5: Production Readiness
- [ ] Security audit
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Mobile testing
- [ ] Privacy policy
- [ ] Uninstall cleanup
- [ ] Shopify app submission

---

## Development Priorities

### Before Every Commit
- [ ] Code has error handling
- [ ] Code handles missing data gracefully
- [ ] Inputs are validated
- [ ] No `@ts-ignore` in production code
- [ ] Tested on mobile (if UI change)

### Before Every Feature
- [ ] Reviewed compliance checklist
- [ ] Planned error handling
- [ ] Considered security implications
- [ ] Added loading states
- [ ] Planned test cases

### Before Production
- [ ] All features tested
- [ ] Security audit complete
- [ ] Performance tested
- [ ] Accessibility tested
- [ ] Privacy policy published
- [ ] Uninstall cleanup working

---

## Resources

### Shopify Documentation
- [App Review Guidelines](https://shopify.dev/docs/apps/launch/app-review) - **READ BEFORE SUBMISSION**
- [Checkout UI Extensions](https://shopify.dev/docs/api/checkout-ui-extensions)
- [Security Best Practices](https://shopify.dev/docs/apps/best-practices/security) - **CRITICAL**
- [Polaris Components](https://shopify.dev/docs/api/checkout-ui-extensions/latest/polaris-web-components)
- [Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)

### Framework Documentation
- [React Router](https://reactrouter.com/)
- [Preact](https://preactjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Development Tools
- [Shopify Partner Dashboard](https://partners.shopify.com/)
- [Dev Store Admin](https://admin.shopify.com/store/nudun-dev-store)
- [GraphiQL Explorer](https://shopify.dev/docs/apps/tools/graphiql-admin-api)

### Compliance Resources
- [GDPR Compliance Guide](https://shopify.dev/docs/apps/launch/privacy-compliance)
- [Webhook Security](https://shopify.dev/docs/apps/build/webhooks)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Support & Contact

**Project**: NUDUN Checkout Pro  
**Organization**: Nuwud Multimedia  
**Store**: nudun-dev-store.myshopify.com  
**Status**: Foundation Complete ✅ | Shopify Compliance Baseline ✅

---

**Last Updated**: October 7, 2025  
**Next Milestone**: Dynamic Messaging Engine (Phase 2) with full compliance  
**Priority**: Shopify approval compliance in all new features

---

## Quick Tips

��� **New to the project?** Read docs in this order:
1. SHOPIFY-APPROVAL-CHECKLIST.md
2. README.md
3. .github/copilot-instructions.md
4. IMPLEMENTATION-GUIDE.md

��� **Extension not showing?** → DEBUG-EXTENSION-NOT-SHOWING.md

��� **Building a feature?** → Keep QUICK-REFERENCE.md visible

��� **Before pushing code?** → Review SHOPIFY-APPROVAL-CHECKLIST.md

��� **Testing?** → Test on mobile, check accessibility

��� **Security concern?** → When in doubt, be more secure
