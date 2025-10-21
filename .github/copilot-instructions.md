# NUDUN Checkout Pro - AI Agent Guide

## � Spec-Driven Development with Spec-Kit

This project uses [GitHub Spec-Kit](https://github.com/github/spec-kit) for structured, specification-driven development.

**Available Slash Commands**:
- `/speckit.constitution` - Review/update project governing principles (`.specify/memory/constitution.md`)
- `/speckit.specify` - Create feature specifications with requirements and user stories
- `/speckit.plan` - Generate technical implementation plans with chosen tech stack
- `/speckit.tasks` - Break down plans into actionable, reviewable tasks
- `/speckit.implement` - Execute tasks to build features according to plan

**Constitution Location**: `.specify/memory/constitution.md` - Contains non-negotiable development principles
**Process**: Constitution → Spec → Plan → Tasks → Implementation

**When to Use Spec-Kit**:
- Building new features (use `/speckit.specify` first)
- Planning technical approach (use `/speckit.plan` after spec)
- Breaking down complex work (use `/speckit.tasks` for implementation steps)
- Need structured guidance (review constitution for principles)

---

## �🎯 AI Agent Quick Reference Card
**ALWAYS CHECK THESE FIRST - Do NOT skip when debugging:**

### Extension Issues? Follow This Order:
1. ✅ **API Version**: Check `shopify.extension.toml` → `api_version = "2025-10"` → Requires Preact JSX
2. ✅ **Environment**: Store = nudun-dev-store | App ID = 286617272321 | Extension placed in editor
3. ✅ **Pattern**: Import from `'@shopify/ui-extensions/preact'` → Use `render()` → JSX syntax
4. ✅ **Data Structures**: Money objects have `.amount` and `.currencyCode` properties (NOT plain numbers)
5. ✅ **Reference**: See `docs/SHOPIFY-API-CONTRACT-2025-10.md` for complete API contract and what properties actually exist

### Current Extension API (2025-10):
```jsx
// ✅ CORRECT - This works
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
export default async () => { render(<Extension />, document.body); };

// ❌ WRONG - This causes "not a function" error
export default (root) => { const banner = root.createComponent(...); };
```

### Money Object Pattern:
```jsx
// ✅ CORRECT
const obj = shopify?.cost?.totalAmount?.value;
const amount = obj?.amount || '0.00';
return <s-text>${amount}</s-text>;

// ❌ WRONG - Shows "[object Object]"
const total = shopify.cost.totalAmount.value;
return <s-text>${total}</s-text>;
```

**See full debugging protocol below before writing any extension code.**

---

## ⚠️ CRITICAL: Shopify Approval Requirements
**This app MUST pass Shopify's app review process**. Before implementing any feature:
1. ✅ Read `SHOPIFY-APPROVAL-CHECKLIST.md` for compliance requirements
2. ✅ Use proper error handling (try/catch, optional chaining)
3. ✅ Never use `@ts-ignore` in production code (only in .template reference files)
4. ✅ Validate all inputs and API responses
5. ✅ Implement graceful degradation when data is unavailable
6. ✅ Follow GDPR/privacy requirements for customer data
7. ✅ Test thoroughly on mobile devices and different browsers

**When in doubt, prioritize security, privacy, and user experience over convenience.**

## 🚨 CRITICAL: Extension Debugging Protocol
**ALWAYS follow this order when debugging Shopify extension issues. Do NOT skip steps.**

### Step 1: Verify API Version FIRST (2 minutes)
Before writing ANY extension code or debugging ANY error:
1. ✅ Check `shopify.extension.toml` for `api_version` value
2. ✅ Search official Shopify docs: "Checkout UI Extensions [version number]"
3. ✅ Verify your export pattern matches the API version requirements
4. ✅ Confirm dependencies match the API version (Preact for 2025-10)

**Why This Matters**: API 2025-10 uses Preact JSX. Older versions used vanilla JS. Using wrong pattern = generic "not a function" errors that waste hours.

### Step 2: Verify Environment (3 minutes)
1. ✅ Correct store selected in Shopify CLI (nudun-dev-store.myshopify.com)
2. ✅ Store has "Checkout and Customer Accounts Extensibility" enabled
3. ✅ App is installed in the correct store
4. ✅ Extension is placed in checkout editor (drag from sidebar)
5. ✅ Using correct app ID (286617272321 - NUDUN Checkout Pro)

**Why This Matters**: Extensions build successfully but won't render without proper environment setup. Looks like code bug but is configuration issue.

### Step 3: Check Build & Dependencies (2 minutes)
1. ✅ Extension builds without errors (`npm run dev`)
2. ✅ All dependencies installed
3. ✅ No TypeScript errors in extension code
4. ✅ No deprecation warnings in console

### Step 4: Debug Code (Only after above passes)
1. ✅ Add error boundaries and logging
2. ✅ Test with minimal working example
3. ✅ Verify data structures (Money objects, etc.)
4. ✅ Check optional chaining for null safety

**RED FLAG SIGNALS** - When you see these, go back to Step 1:
- ⚠️ Generic "not a function" error with no line number
- ⚠️ Extension builds but doesn't render
- ⚠️ Multiple pattern variations all fail
- ⚠️ Error has no actionable information
- ⚠️ After 3 failed attempts, question fundamental assumptions

**Reference**: See `docs/session-notes/DEBUGGING-LESSONS-LEARNED.md` for detailed analysis of what went wrong and how to avoid it.

## Project Overview
NUDUN Checkout Pro is a Shopify Plus app built on React Router 7 and Shopify's checkout UI extensions. It provides real-time dynamic messaging, subscription intelligence, and behavioral analytics in the checkout flow.

**Core Features**:
1. **Dynamic Messaging Engine**: Real-time cart analysis and conditional content display
2. **Product Intelligence**: Subscription detection and smart upsell logic
3. **Behavioral Analytics**: User interaction tracking and abandonment prevention
4. **Merchant Configuration**: No-code rule builder and dashboard for merchants
5. **A/B Testing Framework**: Built-in experimentation capabilities for optimization

**Architecture**: Monorepo with embedded Shopify app (`/app`) + checkout UI extension workspace (`/extensions/nudun-messaging-engine`)

## Key Technologies
- **Framework**: React Router 7 (migrated from Remix)
- **Shopify Integration**: `@shopify/shopify-app-react-router` v1.0+
- **UI Components**: Shopify Polaris Web Components (`<s-*>` tags, not React components)
- **Database**: Prisma with SQLite (production: consider MySQL/PostgreSQL)
- **Extensions**: Checkout UI Extensions API 2025-10
- **Auth**: Shopify App Bridge + Session Tokens

## Critical Developer Workflows

### Development
```bash
npm run dev              # Starts Shopify CLI tunnel + Vite server
npm run build            # Production build
npm run setup            # Prisma generate + migrations
npm run typecheck        # Type checking without emitting
```

**Never run `shopify app dev` directly** - always use `npm run dev` which wraps it with proper configuration.

### Database Migrations
```bash
npx prisma migrate dev --name <migration_name>  # Create migration
npm run setup                                    # Apply in production
```

Session data is stored in SQLite (`prisma/dev.sqlite`). Schema: `Session` model in `prisma/schema.prisma`.

### Extension Development
Extensions live in `extensions/*` workspace. Each has:
- `shopify.extension.toml` - Configuration (targets, API access, settings)
- `src/` - Source code (JSX/TSX)
- `locales/` - i18n translations (en.default.json, fr.json)

To test extensions: `npm run dev` automatically loads them into checkout preview.

## Project-Specific Patterns

### Authentication Pattern
**All admin routes** must authenticate in loaders:
```typescript
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  // or destructure to use admin API:
  const { admin } = await authenticate.admin(request);
  return { data };
};
```

**Webhooks** authenticate differently:
```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  // process webhook
};
```

### Navigation in Embedded Apps
**Critical**: Never use standard React Router redirects or `<a>` tags in embedded app context:
- ✅ Use `<s-link href="/path">` for navigation
- ✅ Use `redirect` from `authenticate.admin()` (not React Router's redirect)
- ✅ Use `useSubmit()` from React Router for form submissions
- ❌ Never use `<a>` tags (breaks iframe session)
- ❌ Never use React Router's `redirect()` in loaders/actions

### Polaris Web Components
This app uses **Polaris web components**, not React components:
```tsx
// ✅ Correct - web components
<s-page heading="Title">
  <s-button onClick={handler}>Click</s-button>
  <s-banner tone="info">Message</s-banner>
</s-page>

// ❌ Wrong - these are React components (not available here)
<Page><Button>Click</Button></Page>
```

Types available via `@shopify/polaris-types`. Web components use kebab-case attributes.

### GraphQL Queries
- **Admin API**: Use `admin.graphql()` from authenticated request
- **Type Generation**: Run `npm run graphql-codegen` after schema changes
- **Configuration**: `.graphqlrc.ts` configures GraphQL tooling with Admin API v2025-10
- **Fragments**: Declare with `#graphql` tag for syntax highlighting and tooling

Example:
```typescript
const response = await admin.graphql(
  `#graphql
    query GetProducts {
      products(first: 10) {
        edges {
          node { id title }
        }
      }
    }`
);
const data = await response.json();
```

### Checkout UI Extensions
Located in `extensions/nudun-messaging-engine/src/`:

**Target**: `purchase.checkout.block.render` (requires manual placement in checkout editor)

**API Version**: 2025-10 - Uses **Preact** with JSX (NOT vanilla JavaScript!)

**✅ CORRECT Export Format for 2025-10**:
```jsx
import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  return (
    <s-banner tone="critical">
      <s-heading>Title</s-heading>
      <s-text>Message</s-text>
    </s-banner>
  );
}
```

**❌ WRONG - Do NOT Use**:
```jsx
// This vanilla JS API does NOT exist in 2025-10
export default (root) => {
  const banner = root.createComponent('Banner', {...});
  root.appendChild(banner);
};
```

**Key Preact Patterns**:
- Import from `'@shopify/ui-extensions/preact'` (not `/checkout`)
- Use `render()` to mount to `document.body`
- Return JSX with Polaris web components (`<s-*>`)
- Can use Preact hooks: `useState`, `useEffect`, etc.
- Can use Preact Signals for reactive state
- Extension function must be `async` and export as default

**Shopify Global API**:
Access checkout data via the global `shopify` object (available in extension scope):
```jsx
function Extension() {
  // Shopify provides reactive signals automatically
  const cart = shopify.cost.totalAmount.value;
  const country = shopify.shippingAddress.value?.countryCode;
  const lineItems = shopify.lines.value;
  
  return <s-text>Total: {cart} for {country}</s-text>;
}
```

**CRITICAL: Money Object Pattern**:
`shopify.cost.totalAmount.value` returns a **Money object**, NOT a plain number:
```jsx
function Extension() {
  // ✅ CORRECT - Access Money object properties
  const totalAmountObj = shopify?.cost?.totalAmount?.value;
  
  // Money object structure: { amount: "125.00", currencyCode: "USD" }
  const amount = totalAmountObj?.amount || '0.00';        // Get numeric amount
  const currency = totalAmountObj?.currencyCode || 'USD'; // Get currency code
  
  return <s-text>Total: ${amount}</s-text>; // Display: $125.00
  
  // ❌ WRONG - This won't work
  // const total = shopify.cost.totalAmount.value; // This is an object, not a number
  // return <s-text>Total: ${total}</s-text>;      // Will display "[object Object]"
}
```

**Key Money Object Properties**:
- `amount`: String representation of the amount (e.g., "125.00")
- `currencyCode`: ISO 4217 currency code (e.g., "USD", "EUR", "CAD")

**Common Money Object Locations**:
- `shopify.cost.totalAmount.value` - Cart total
- `shopify.cost.subtotalAmount.value` - Subtotal (before shipping/tax)
- `shopify.cost.totalTaxAmount.value` - Total tax
- `shopify.cost.totalShippingAmount.value` - Shipping cost
- `line.cost.totalAmount.value` - Individual line item total

**Available Polaris Components** (JSX):
- `<s-banner tone="info|warning|critical">` - Alert banners (use `<s-heading>` for title inside)
- `<s-heading>` - Headings (not a `title` prop on banner)
- `<s-text>` - Text display
- `<s-stack direction="inline|block">` - Layout containers
- `<s-button onClick={handler}>` - Interactive buttons
- `<s-image src="...">` - Images
- `<s-checkbox>`, `<s-text-field>`, `<s-select>` - Form inputs

**Critical Notes**:
- **Must use Preact JSX format** - vanilla JS `root.createComponent()` API does not exist
- Extension requires `preact` package + `@shopify/ui-extensions` in dependencies
- Extension only renders after **manual placement** in checkout editor
- Merchants must **drag extension from sidebar** into checkout layout
- Access to `shopify` global for checkout data (cart, customer, shipping, etc.)
- Banner component uses `tone` prop (not `status`), no `title` prop (use `<s-heading>` child)

**Configuration**:
- `shopify.extension.toml` must specify `api_version = "2025-10"`
- Extension must be listed in workspace `extensions/` folder
- Package.json must include Preact dependencies: `"preact": "^10.10.x"`

### Error Handling
Export `ErrorBoundary` with Shopify's boundary helper:
```typescript
import { boundary } from "@shopify/shopify-app-react-router/server";

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
```

This ensures Shopify-specific error headers are preserved.

## File Structure Conventions

### Routes
- `app/routes/app.*.tsx` - Admin routes (require auth)
- `app/routes/webhooks.*.tsx` - Webhook handlers (action exports only)
- `app/routes/auth.*.tsx` - Auth flow routes
- `app/routes/_index/` - Special: nested route with styles

Routing uses `@react-router/fs-routes` flat routes (configured in `app/routes.ts`).

### Server Files
- `app/*.server.ts` - Server-only modules (never bundled to client)
- `shopify.server.ts` - Core Shopify configuration (API keys, scopes, session storage)
- `db.server.ts` - Prisma client singleton (global in dev, fresh in prod)

### Configuration
- `shopify.app.toml` - App metadata, webhooks, scopes, auth URLs
- `shopify.app.nudun-checkout-pro.toml` - Environment-specific overrides
- `.graphqlrc.ts` - GraphQL tooling (admin API + extension schemas)
- `vite.config.ts` - Dev server with HMR and Shopify tunnel compatibility

## Common Issues & Solutions

### "Table does not exist" Error
Run `npm run setup` to generate Prisma client and apply migrations.

### Webhook Not Updating
- **Prefer app-specific webhooks** in `shopify.app.toml` over `registerWebhooks()`
- Changes sync automatically on `npm run deploy`
- For shop-specific webhooks, reinstall app to trigger `afterAuth` hook

### GraphQL Hints Wrong
If using non-Admin APIs (Storefront, third-party), update `.graphqlrc.ts` project configuration.

### JWT "nbf" Errors
Clock sync issue. Enable "Set time automatically" in system date/time settings.

### Streaming/Defer Not Working Locally
Cloudflare tunnel buffers responses. Use localhost-based development for testing `<Await>` streaming.

## Environment Variables
Required (set via Shopify CLI or `.env`):
- `SHOPIFY_API_KEY` - App client ID
- `SHOPIFY_API_SECRET` - App secret
- `SHOPIFY_APP_URL` - Public app URL
- `SCOPES` - Comma-separated (e.g., "write_products")
- `NODE_ENV` - Set to "production" for deployment

Optional:
- `SHOP_CUSTOM_DOMAIN` - Custom shop domain support

## Deployment
1. Build: `npm run build`
2. Set `NODE_ENV=production`
3. Run migrations: `npm run setup`
4. Start: `npm start`
5. Docker: `npm run docker-start` (includes setup)

**Important**: SQLite only works for single-instance deployments. Switch to MySQL/PostgreSQL for multi-instance production.

## Testing Strategy
- Extensions: Test in checkout preview via `npm run dev`
- Webhooks: Trigger manually via Shopify admin (e.g., update product title for `PRODUCTS_UPDATE`)
- CLI webhook triggers: For experimentation only (creates non-existent shop, `admin` undefined)

## Code Style
- TypeScript for all new files (`.ts`/`.tsx`)
- Functional React components with hooks
- ESLint + Prettier configured
- JSDoc comments on public functions
- Proper loading/error states
- Mobile-responsive by default

## Resources
- [React Router Docs](https://reactrouter.com/)
- [Shopify App React Router](https://shopify.dev/docs/api/shopify-app-react-router)
- [Checkout UI Extensions](https://shopify.dev/docs/api/checkout-ui-extensions)
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)

---

## Future Roadmap

### Unique Differentiators ("Wow" Features)

#### 1. Real-time Dynamic Messaging
**Description**: Contextual banners, alerts, and upsell prompts that update instantly as customers change cart lines or shipping address.

**Acceptance Criteria**:
- ✅ Messages update without page reload when cart changes
- ✅ Conditional logic supports cart total, item count, product type, shipping country
- ✅ Merchant can configure rules via admin dashboard
- ✅ Messages respect customer locale and device type

**Example Implementation**:
```jsx
function DynamicMessage() {
  const cartTotal = shopify?.cost?.totalAmount?.value;
  const country = shopify?.shippingAddress?.value?.countryCode;
  
  // Fetch merchant rules from API
  const rules = useMerchantRules();
  const message = evaluateRules(rules, { cartTotal, country });
  
  if (!message) return null;
  
  return (
    <s-banner tone={message.tone}>
      <s-heading>{message.title}</s-heading>
      <s-text>{message.body}</s-text>
    </s-banner>
  );
}
```

#### 2. Subscription Intelligence
**Description**: Auto-detect subscription products and surface tailored benefits, renewal reminders, and loyalty incentives directly in checkout.

**Acceptance Criteria**:
- ✅ Detect subscription products via `line.sellingPlan` or metafields
- ✅ Display subscription benefits (savings %, free shipping, loyalty points)
- ✅ Show renewal reminder with next billing date
- ✅ Offer one-time purchase alternative with comparison

**Example Implementation**:
```jsx
function SubscriptionBanner() {
  const lines = shopify?.lines?.value || [];
  const subscriptions = lines.filter(line => line.sellingPlan);
  
  if (subscriptions.length === 0) return null;
  
  const savings = calculateSubscriptionSavings(subscriptions);
  
  return (
    <s-banner tone="success">
      <s-heading>🎉 Subscribe & Save</s-heading>
      <s-text>
        You're saving ${savings} with your subscription! 
        Next delivery: {getNextDeliveryDate()}
      </s-text>
    </s-banner>
  );
}
```

#### 3. Behavioral Analytics Hooks
**Description**: Capture granular checkout events (field focus, address changes, discount code attempts) and stream to analytics platform for micro-A/B testing.

**Acceptance Criteria**:
- ✅ Track checkout field interactions (focus, blur, change)
- ✅ Capture cart modifications, discount applications, shipping selections
- ✅ Send events to merchant's analytics platform (GA4, Segment, etc.)
- ✅ Privacy-compliant (GDPR, no PII without consent)
- ✅ Configurable event filtering in admin dashboard

**Example Implementation**:
```jsx
function AnalyticsTracker() {
  const lines = shopify?.lines?.value;
  const discountCodes = shopify?.discountCodes?.value;
  
  useEffect(() => {
    // Track cart changes
    shopify.analytics.publish('cart_updated', {
      itemCount: lines?.length,
      totalValue: shopify.cost.totalAmount.value
    });
  }, [lines]);
  
  useEffect(() => {
    // Track discount application
    if (discountCodes?.length > 0) {
      shopify.analytics.publish('discount_applied', {
        code: discountCodes[0]?.code
      });
    }
  }, [discountCodes]);
  
  return null; // No UI, pure tracking
}
```

#### 4. Checkout Attribute Automation
**Description**: Use Checkout UI Extensions API to inject or update cart attributes (e.g. "apply gift packaging" flag) without page reload.

**Acceptance Criteria**:
- ✅ Checkbox/input updates cart attributes in real-time
- ✅ Attributes persist through checkout completion
- ✅ Merchant can define custom attributes in admin
- ✅ Support for text, boolean, and select field types

**Example Implementation**:
```jsx
function GiftPackagingOption() {
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  
  const handleToggle = async (checked) => {
    setIsGiftWrapped(checked);
    
    // Update cart attributes via API
    await shopify.cart.updateAttributes({
      gift_wrap: checked ? 'yes' : 'no',
      gift_message: checked ? giftMessage : ''
    });
  };
  
  return (
    <s-stack>
      <s-checkbox checked={isGiftWrapped} onChange={handleToggle}>
        Add gift wrapping (+$5.00)
      </s-checkbox>
      {isGiftWrapped && (
        <s-text-field
          label="Gift message"
          value={giftMessage}
          onChange={setGiftMessage}
        />
      )}
    </s-stack>
  );
}
```

#### 5. Advanced Localization with shopify.i18n
**Description**: Integrate shopify.i18n to swap messages, banners, and button labels on the fly based on customer locale.

**Acceptance Criteria**:
- ✅ Support for 50+ languages via locales/ folder
- ✅ Dynamic locale switching based on shipping address
- ✅ Merchant can customize translations in admin
- ✅ Fallback to default locale if translation missing
- ✅ Currency formatting respects locale

**Example Implementation**:
```jsx
// locales/en.default.json
{
  "banner.free_shipping": "Free shipping on orders over {amount}",
  "banner.subscription_save": "Save {percent}% with subscription"
}

// locales/fr.json
{
  "banner.free_shipping": "Livraison gratuite pour les commandes de plus de {amount}",
  "banner.subscription_save": "Économisez {percent}% avec l'abonnement"
}

// Extension code
function LocalizedBanner() {
  const locale = shopify?.localization?.value?.isoCode || 'en';
  const threshold = shopify.cost.subtotalAmount.value >= 50;
  
  return (
    <s-banner tone="info">
      <s-text>
        {shopify.i18n.translate('banner.free_shipping', {
          amount: shopify.i18n.formatCurrency(50)
        })}
      </s-text>
    </s-banner>
  );
}
```

#### 6. Lightweight Preact & Web Components (<50KB)
**Description**: Preact-based UI extensions keep bundle size under 50 KB vs competitors' heavier React bundles.

**Acceptance Criteria**:
- ✅ Production bundle < 50KB (minified + gzipped)
- ✅ Lazy loading for non-critical components
- ✅ Tree-shaking eliminates unused Polaris components
- ✅ Fast initial render (<100ms)
- ✅ Lighthouse performance score > 95

**Implementation Notes**:
- Use Preact instead of React (3KB vs 45KB)
- Import only needed Polaris components
- Avoid heavy dependencies (moment.js, lodash)
- Use native browser APIs when possible
- Code splitting for admin dashboard

#### 7. Dev-Store Extensibility Preview Workflow
**Description**: Fully automated via Shopify CLI with "checkout extensibility"-enabled dev stores, streamlining local testing without manual theme edits.

**Acceptance Criteria**:
- ✅ Single `npm run dev` starts tunnel + preview
- ✅ Extension auto-rebuilds on file save
- ✅ Hot reload in checkout editor
- ✅ Preview URL accessible on mobile devices
- ✅ No manual theme modifications required

**Workflow**:
```bash
# 1. Start dev server
npm run dev

# 2. Output shows:
# ✓ Extension building...
# ✓ Preview URL: https://checkout.shopify.com/...
# ✓ Tunnel active: https://xxx.trycloudflare.com

# 3. Edit extension code
# 4. Save file
# 5. Refresh preview URL (extension auto-updated)
```

#### 8. Copilot-Driven Extension Development
**Description**: Rich `.github/copilot-instructions.md` empowers Copilot to bootstrap new extensions, fix breaking API changes, and refactor in seconds.

**Acceptance Criteria**:
- ✅ Copilot can generate new extension from natural language
- ✅ Copilot suggests fixes for Shopify API deprecations
- ✅ Copilot refactors code following Shopify approval patterns
- ✅ Copilot adds error handling and loading states automatically
- ✅ Documentation stays in sync with code

**Example Prompts**:
- "Create a countdown timer extension for flash sales"
- "Add error handling to all shopify global access"
- "Refactor this extension to use optional chaining"
- "Generate GraphQL query for product metafields"

### Core Checkout App Capabilities (Matched or Improved)

#### 9. Seamless Embedded App Navigation
**Status**: ✅ Implemented
- Uses `<s-link>` and App Bridge redirects
- No `<a>` tags or React Router redirects
- No iframe session breaks

#### 10. Secure Admin & Webhook Auth Patterns
**Status**: ✅ Implemented
- `authenticate.admin()` in all admin loaders
- `authenticate.webhook()` with HMAC verification
- Session token validation built-in

#### 11. Prisma-backed Session Storage
**Status**: ✅ Implemented
- SQLite for dev (prisma/dev.sqlite)
- Easy migration to PostgreSQL for production
- Automated migrations with `npm run setup`

#### 12. GraphQL Codegen & Fragments
**Status**: ✅ Implemented
- Inline `#graphql` fragments with syntax highlighting
- Type-safe queries with generated types
- `npm run graphql-codegen` on schema changes

#### 13. Comprehensive Error Boundaries
**Status**: ✅ Implemented
- `boundary.error` and `boundary.headers` helpers
- Consistent error handling across routes and extensions
- User-friendly error messages

#### 14. Multi-env Config via TOML Overrides
**Status**: ✅ Implemented
- `shopify.app.toml` for base config
- `shopify.app.nudun-checkout-pro.toml` for overrides
- Per-extension settings in `shopify.extension.toml`

#### 15. Polaris Web Components Everywhere
**Status**: ✅ Implemented
- Uniform `<s-*>` components in app and extensions
- No React/Polaris version mismatches
- Consistent design language

#### 16. Dev Server Tunnels & Preview URLs
**Status**: ✅ Implemented
- Single `npm run dev` command
- Wraps Shopify CLI tunnel + Vite + Prisma
- No manual command juggling

---

## Advanced Implementation Patterns

### Pattern: Conditional Message Rendering
```jsx
function ConditionalMessage() {
  const rules = useMerchantRules(); // Fetch from API
  const context = {
    cartTotal: shopify?.cost?.totalAmount?.value,
    itemCount: shopify?.lines?.value?.length,
    country: shopify?.shippingAddress?.value?.countryCode,
    hasSubscription: shopify?.lines?.value?.some(l => l.sellingPlan)
  };
  
  const matchedRule = rules.find(rule => evaluateCondition(rule, context));
  
  if (!matchedRule) return null;
  
  return (
    <s-banner tone={matchedRule.tone}>
      <s-heading>{interpolate(matchedRule.title, context)}</s-heading>
      <s-text>{interpolate(matchedRule.body, context)}</s-text>
    </s-banner>
  );
}
```

### Pattern: Analytics Event Tracking
```jsx
function useCheckoutAnalytics() {
  const trackEvent = useCallback((eventName, properties) => {
    // Send to merchant's analytics platform
    shopify.analytics.publish(eventName, {
      ...properties,
      timestamp: Date.now(),
      sessionId: shopify.sessionToken
    });
  }, []);
  
  return { trackEvent };
}
```

### Pattern: Subscription Detection
```jsx
function detectSubscriptions(lines) {
  return lines
    .filter(line => line.sellingPlan || line.metafield?.subscription)
    .map(line => ({
      productId: line.id,
      frequency: line.sellingPlan?.deliveryPolicy?.interval,
      savings: calculateSavings(line)
    }));
}
```

---

## Next Steps for Implementation

1. **Phase 2A: Dynamic Messaging Engine** (2 weeks)
   - Build rule builder UI in admin
   - Implement rule evaluation logic in extension
   - Add cart context analysis
   - Create message interpolation system

2. **Phase 2B: Subscription Intelligence** (1 week)
   - Add subscription detection
   - Build benefits calculator
   - Create subscription banner component
   - Add renewal reminder logic

3. **Phase 3: Analytics & Tracking** (2 weeks)
   - Implement event tracking system
   - Build analytics dashboard
   - Add privacy controls
   - Create export functionality

4. **Phase 4: Advanced Features** (3 weeks)
   - Checkout attribute automation
   - Advanced i18n system
   - A/B testing framework
   - Performance optimization

5. **Phase 5: Polish & Launch** (2 weeks)
   - Security audit
   - Accessibility testing
   - Performance testing
   - Shopify app submission
