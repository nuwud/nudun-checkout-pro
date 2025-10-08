# Checkout Extension Specifications

**NUDUN Checkout Pro - Advanced Checkout Customization Platform**

---

## Document Overview

This specification defines the advanced capabilities that differentiate NUDUN Checkout Pro from standard checkout applications, plus the core features we've matched or improved upon.

**Version**: 1.0.0  
**Last Updated**: October 7, 2025  
**Status**: Foundation Complete | Roadmap Defined

---

## Table of Contents

1. [Unique Differentiators](#unique-differentiators)
2. [Core Capabilities](#core-capabilities)
3. [Technical Architecture](#technical-architecture)
4. [API Specifications](#api-specifications)
5. [Performance Requirements](#performance-requirements)
6. [Security & Compliance](#security--compliance)

---

## Unique Differentiators

These features set NUDUN Checkout Pro apart from competitors and provide unique value to merchants.

### 1. Real-time Dynamic Messaging

**Description**: Intelligent, context-aware messaging system that updates checkout UI in real-time based on cart state, customer behavior, and merchant-defined rules.

**Business Value**:
- Increase AOV with targeted upsell messages
- Reduce cart abandonment with timely incentives
- Improve conversion with relevant trust signals
- Personalize checkout experience by segment

**Acceptance Criteria**:
- [ ] Messages update instantly on cart changes (no page reload)
- [ ] Rule engine supports 10+ condition types (cart total, item count, product tags, shipping country, customer type, etc.)
- [ ] Merchant can create unlimited rules via admin dashboard
- [ ] Rules support AND/OR logic and nested conditions
- [ ] Messages respect customer locale, device type, and timezone
- [ ] Preview mode shows message before publishing
- [ ] Message analytics track impressions, clicks, and conversions

**Technical Specification**:

```typescript
// Rule Schema
interface MessagingRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number; // Higher priority rules evaluated first
  conditions: RuleCondition[];
  message: MessageContent;
  schedule?: DateRange;
  targeting?: CustomerSegment;
}

interface RuleCondition {
  type: 'cart_total' | 'item_count' | 'product_tag' | 'shipping_country' | 'custom';
  operator: 'gt' | 'lt' | 'eq' | 'contains' | 'in';
  value: any;
  logic?: 'AND' | 'OR'; // For combining with next condition
}

interface MessageContent {
  tone: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  body: string;
  cta?: {
    text: string;
    url: string;
  };
  interpolations?: Record<string, string>; // {cartTotal}, {itemCount}, etc.
}
```

**Example Usage**:
```jsx
// Extension code
import { useRuleEngine } from './hooks/useRuleEngine';

function DynamicMessageBanner() {
  const { activeMessage, trackImpression } = useRuleEngine();
  
  useEffect(() => {
    if (activeMessage) {
      trackImpression(activeMessage.id);
    }
  }, [activeMessage]);
  
  if (!activeMessage) return null;
  
  return (
    <s-banner tone={activeMessage.tone}>
      <s-heading>{activeMessage.title}</s-heading>
      <s-text>{activeMessage.body}</s-text>
      {activeMessage.cta && (
        <s-button onClick={() => trackClick(activeMessage.id)}>
          {activeMessage.cta.text}
        </s-button>
      )}
    </s-banner>
  );
}
```

**Database Schema**:
```prisma
model MerchantRule {
  id          String   @id @default(cuid())
  merchantId  String
  name        String
  enabled     Boolean  @default(true)
  priority    Int      @default(0)
  conditions  Json     // RuleCondition[]
  message     Json     // MessageContent
  schedule    Json?    // DateRange
  targeting   Json?    // CustomerSegment
  impressions Int      @default(0)
  clicks      Int      @default(0)
  conversions Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([merchantId, enabled])
}
```

**API Endpoints**:
```typescript
// GET /api/rules - List all rules for merchant
// POST /api/rules - Create new rule
// PUT /api/rules/:id - Update rule
// DELETE /api/rules/:id - Delete rule
// GET /api/rules/evaluate - Get active message for current context
// POST /api/analytics/impression - Track message impression
// POST /api/analytics/click - Track message click
```

---

### 2. Subscription Intelligence

**Description**: Automatic detection and enhancement of subscription products with benefits visualization, renewal reminders, and loyalty incentives.

**Business Value**:
- Increase subscription adoption rates
- Reduce subscription churn with clear benefits
- Drive LTV with loyalty rewards visibility
- Educate customers on subscription value

**Acceptance Criteria**:
- [ ] Auto-detect subscriptions via `sellingPlan` or metafields
- [ ] Display savings percentage vs one-time purchase
- [ ] Show next billing date and renewal details
- [ ] Highlight loyalty benefits (free shipping, points, early access)
- [ ] Offer one-time purchase alternative with comparison
- [ ] Support multiple subscription frequencies
- [ ] Customizable benefits messaging in admin

**Technical Specification**:

```typescript
interface SubscriptionDetails {
  lineItemId: string;
  productTitle: string;
  sellingPlan: {
    name: string;
    interval: 'day' | 'week' | 'month';
    intervalCount: number;
    deliveryPolicy: any;
  };
  pricing: {
    oneTimePrice: number;
    subscriptionPrice: number;
    savingsAmount: number;
    savingsPercent: number;
  };
  benefits: SubscriptionBenefit[];
  nextDelivery?: Date;
}

interface SubscriptionBenefit {
  icon: string;
  title: string;
  description: string;
}
```

**Example Usage**:
```jsx
function SubscriptionIntelligenceBanner() {
  const lines = shopify?.lines?.value || [];
  const subscriptions = detectSubscriptions(lines);
  
  if (subscriptions.length === 0) return null;
  
  const totalSavings = subscriptions.reduce(
    (sum, sub) => sum + sub.pricing.savingsAmount, 
    0
  );
  
  return (
    <s-banner tone="success">
      <s-heading>🎉 You're Subscribed & Saving!</s-heading>
      <s-text>
        Total savings: ${totalSavings.toFixed(2)} ({avgPercent}%)
      </s-text>
      <s-stack direction="block">
        {subscriptions[0].benefits.map(benefit => (
          <s-text key={benefit.title}>
            {benefit.icon} {benefit.title}
          </s-text>
        ))}
      </s-stack>
      <s-text size="small">
        Next delivery: {formatDate(getNextDeliveryDate(subscriptions))}
      </s-text>
    </s-banner>
  );
}

function detectSubscriptions(lines: LineItem[]): SubscriptionDetails[] {
  return lines
    .filter(line => line.sellingPlan || line.hasSubscriptionMetafield)
    .map(line => ({
      lineItemId: line.id,
      productTitle: line.merchandise.product.title,
      sellingPlan: line.sellingPlan,
      pricing: calculateSubscriptionPricing(line),
      benefits: getSubscriptionBenefits(line),
      nextDelivery: calculateNextDelivery(line.sellingPlan)
    }));
}
```

**Database Schema**:
```prisma
model SubscriptionBenefit {
  id          String   @id @default(cuid())
  merchantId  String
  icon        String   // Emoji or icon name
  title       String
  description String
  enabled     Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  
  @@index([merchantId, enabled])
}
```

---

### 3. Behavioral Analytics Hooks

**Description**: Granular event tracking system that captures checkout interactions and streams data to analytics platforms for micro-A/B testing and conversion optimization.

**Business Value**:
- Identify friction points in checkout flow
- A/B test messaging and layout changes
- Track discount code usage patterns
- Measure impact of upsells and cross-sells
- Optimize field completion rates

**Acceptance Criteria**:
- [ ] Track 20+ checkout event types (field focus/blur, cart modifications, discount applications, shipping selections, payment method changes)
- [ ] Privacy-compliant (GDPR, CCPA) - no PII without consent
- [ ] Configurable event filtering in admin dashboard
- [ ] Integration with GA4, Segment, Mixpanel, or custom webhooks
- [ ] Real-time event streaming (< 500ms latency)
- [ ] Event batching to reduce API calls
- [ ] Session tracking with privacy-safe identifiers

**Technical Specification**:

```typescript
interface CheckoutEvent {
  type: CheckoutEventType;
  timestamp: number;
  sessionId: string;
  properties: Record<string, any>;
  metadata?: {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    locale: string;
    checkoutStep: string;
  };
}

type CheckoutEventType = 
  | 'checkout_started'
  | 'cart_updated'
  | 'discount_applied'
  | 'discount_failed'
  | 'shipping_method_selected'
  | 'payment_method_selected'
  | 'field_focused'
  | 'field_blurred'
  | 'field_completed'
  | 'message_viewed'
  | 'message_clicked'
  | 'upsell_viewed'
  | 'upsell_accepted'
  | 'upsell_dismissed';
```

**Example Usage**:
```jsx
function CheckoutAnalytics() {
  const { trackEvent, isEnabled } = useAnalytics();
  const lines = shopify?.lines?.value;
  const discountCodes = shopify?.discountCodes?.value;
  
  // Track cart changes
  useEffect(() => {
    if (isEnabled && lines) {
      trackEvent('cart_updated', {
        itemCount: lines.length,
        totalValue: shopify.cost.totalAmount.value,
        hasSubscription: lines.some(l => l.sellingPlan)
      });
    }
  }, [lines]);
  
  // Track discount code usage
  useEffect(() => {
    if (isEnabled && discountCodes?.length > 0) {
      trackEvent('discount_applied', {
        code: discountCodes[0].code,
        discountAmount: calculateDiscount()
      });
    }
  }, [discountCodes]);
  
  return null; // No UI, pure tracking
}
```

**Privacy Controls**:
```jsx
// Admin UI for configuring analytics
function AnalyticsSettings() {
  return (
    <s-form-layout>
      <s-checkbox checked={trackingEnabled}>
        Enable analytics tracking
      </s-checkbox>
      <s-select
        label="Analytics Platform"
        options={['Google Analytics 4', 'Segment', 'Mixpanel', 'Custom Webhook']}
      />
      <s-checkbox checked={respectDoNotTrack}>
        Respect "Do Not Track" browser setting
      </s-checkbox>
      <s-checkbox checked={anonymizeIP}>
        Anonymize IP addresses
      </s-checkbox>
    </s-form-layout>
  );
}
```

---

### 4. Checkout Attribute Automation

**Description**: Dynamic cart attribute management system that allows customers to add custom instructions, gift options, or delivery preferences without page reload.

**Business Value**:
- Increase AOV with gift wrapping upsells
- Capture delivery instructions to reduce support tickets
- Enable custom product personalization
- Improve customer satisfaction with flexible options

**Acceptance Criteria**:
- [ ] Support for text, boolean, select, and date field types
- [ ] Real-time attribute updates without page reload
- [ ] Attributes persist through checkout completion
- [ ] Merchant can define custom attributes in admin
- [ ] Conditional attribute visibility based on cart state
- [ ] Attribute validation (required, max length, format)
- [ ] Pricing adjustments based on attribute selections

**Technical Specification**:

```typescript
interface CustomAttribute {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'boolean' | 'select' | 'date';
  required: boolean;
  options?: string[]; // For select type
  validation?: {
    pattern?: string; // Regex
    minLength?: number;
    maxLength?: number;
  };
  pricing?: {
    addCost: number; // Additional charge if selected
    displayAs: 'flat' | 'percentage';
  };
  visibility?: RuleCondition[]; // Show only if conditions met
}
```

**Example Usage**:
```jsx
function CustomAttributeFields() {
  const attributes = useMerchantAttributes();
  const [values, setValues] = useState({});
  
  const handleChange = async (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
    
    // Update cart attributes in real-time
    await shopify.cart.updateAttributes({
      [key]: value
    });
  };
  
  return (
    <s-stack direction="block">
      {attributes.map(attr => (
        <AttributeField
          key={attr.id}
          attribute={attr}
          value={values[attr.key]}
          onChange={handleChange}
        />
      ))}
    </s-stack>
  );
}

function AttributeField({ attribute, value, onChange }) {
  switch (attribute.type) {
    case 'boolean':
      return (
        <s-checkbox
          checked={value}
          onChange={checked => onChange(attribute.key, checked)}
        >
          {attribute.label}
          {attribute.pricing && ` (+$${attribute.pricing.addCost})`}
        </s-checkbox>
      );
    
    case 'text':
      return (
        <s-text-field
          label={attribute.label}
          value={value || ''}
          onChange={text => onChange(attribute.key, text)}
          required={attribute.required}
          maxLength={attribute.validation?.maxLength}
        />
      );
    
    case 'select':
      return (
        <s-select
          label={attribute.label}
          value={value}
          onChange={option => onChange(attribute.key, option)}
          options={attribute.options}
        />
      );
    
    default:
      return null;
  }
}
```

**Database Schema**:
```prisma
model CustomAttribute {
  id         String   @id @default(cuid())
  merchantId String
  key        String   // cart.attributes key
  label      String
  type       String   // text, boolean, select, date
  required   Boolean  @default(false)
  options    Json?    // For select type
  validation Json?
  pricing    Json?
  visibility Json?    // RuleCondition[]
  order      Int      @default(0)
  enabled    Boolean  @default(true)
  createdAt  DateTime @default(now())
  
  @@unique([merchantId, key])
  @@index([merchantId, enabled])
}
```

---

### 5. Advanced Localization with shopify.i18n

**Description**: Comprehensive internationalization system that dynamically adapts messaging, formatting, and UI elements based on customer locale.

**Business Value**:
- Expand to international markets seamlessly
- Increase conversion in non-English markets
- Reduce customer confusion with native language
- Comply with local market expectations

**Acceptance Criteria**:
- [ ] Support for 50+ languages via locales folder
- [ ] Dynamic locale detection from shipping address
- [ ] Merchant can customize translations in admin
- [ ] Fallback to default locale if translation missing
- [ ] Currency formatting respects locale (£, €, ¥, etc.)
- [ ] Date/time formatting respects locale
- [ ] Right-to-left (RTL) language support
- [ ] Pluralization rules per language

**Technical Specification**:

```typescript
// locales/en.default.json
{
  "banner": {
    "free_shipping": "Free shipping on orders over {amount}",
    "subscription_save": "Save {percent}% with subscription",
    "limited_time": "Limited time: {hours} hours remaining"
  },
  "attribute": {
    "gift_wrap": "Add gift wrapping",
    "gift_message": "Gift message",
    "delivery_instructions": "Delivery instructions"
  },
  "error": {
    "required_field": "This field is required",
    "invalid_format": "Please enter a valid {field}"
  }
}

// locales/fr.json
{
  "banner": {
    "free_shipping": "Livraison gratuite pour les commandes de plus de {amount}",
    "subscription_save": "Économisez {percent}% avec l'abonnement",
    "limited_time": "Offre limitée : {hours} heures restantes"
  },
  // ... other translations
}
```

**Example Usage**:
```jsx
function LocalizedBanner() {
  const { t, formatCurrency, locale } = useI18n();
  const threshold = 50;
  const remaining = threshold - shopify.cost.subtotalAmount.value;
  
  if (remaining <= 0) {
    return (
      <s-banner tone="success">
        <s-text>{t('banner.free_shipping_unlocked')}</s-text>
      </s-banner>
    );
  }
  
  return (
    <s-banner tone="info">
      <s-text>
        {t('banner.free_shipping', {
          amount: formatCurrency(threshold)
        })}
      </s-text>
      <s-text size="small">
        {t('banner.add_more', {
          amount: formatCurrency(remaining)
        })}
      </s-text>
    </s-banner>
  );
}

// Custom hook for i18n
function useI18n() {
  const locale = shopify?.localization?.value?.isoCode || 'en';
  const translations = loadTranslations(locale);
  
  const t = (key: string, interpolations?: Record<string, any>) => {
    const translation = get(translations, key) || get(defaultTranslations, key);
    return interpolate(translation, interpolations);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: shopify.cost.totalAmount.currencyCode
    }).format(amount);
  };
  
  return { t, formatCurrency, locale };
}
```

---

### 6. Lightweight Preact & Web Components (<50KB)

**Description**: Optimized bundle size using Preact instead of React, with aggressive code splitting and tree-shaking.

**Business Value**:
- Faster checkout load times = higher conversion
- Better mobile performance (especially 3G)
- Lower hosting costs (smaller bandwidth)
- Better Lighthouse scores = SEO benefits

**Acceptance Criteria**:
- [ ] Production bundle < 50KB (minified + gzipped)
- [ ] Initial render < 100ms on mid-range devices
- [ ] Lighthouse performance score > 95
- [ ] Time to Interactive (TTI) < 1.5s
- [ ] First Contentful Paint (FCP) < 1s
- [ ] No render-blocking resources
- [ ] Lazy loading for non-critical components

**Performance Budget**:
```javascript
{
  "bundle": {
    "maxSize": "50KB",
    "warnSize": "45KB"
  },
  "performance": {
    "lighthouse": 95,
    "fcp": 1000,
    "tti": 1500,
    "lcp": 2000
  }
}
```

**Optimization Strategies**:
```jsx
// 1. Use Preact instead of React
import { h, render } from 'preact';

// 2. Dynamic imports for heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 3. Tree-shake unused Polaris components
import { Banner, Text } from '@shopify/polaris'; // ❌ Imports everything
import Banner from '@shopify/polaris/Banner'; // ✅ Tree-shakeable

// 4. Avoid heavy dependencies
import moment from 'moment'; // ❌ 70KB
const date = new Date().toLocaleDateString(); // ✅ Native API

// 5. Code splitting by route
const routes = {
  '/dashboard': () => import('./Dashboard'),
  '/rules': () => import('./Rules'),
  '/analytics': () => import('./Analytics')
};
```

---

### 7. Dev-Store Extensibility Preview Workflow

**Description**: Streamlined development workflow with single-command preview and hot reload.

**Acceptance Criteria**:
- [ ] Single `npm run dev` starts everything
- [ ] Extension auto-rebuilds on file save (<1s)
- [ ] Hot reload without full page refresh
- [ ] Preview URL accessible on mobile devices
- [ ] Cloudflare tunnel auto-connects
- [ ] No manual theme modifications required
- [ ] Console logs show build status clearly

**Workflow Documentation**:
```bash
# Terminal output from npm run dev
$ npm run dev

✓ Prisma generated
✓ Building extension...
✓ Extension built in 847ms

┌─ NUDUN Checkout Pro ─────────────────────────────┐
│                                                    │
│  Preview your app:                                 │
│  https://admin.shopify.com/store/nudun-dev-store   │
│                                                    │
│  Preview your extension:                           │
│  Checkout: https://checkout.shopify.com/c/...     │
│                                                    │
│  App URL:                                          │
│  https://tribe-ensures.trycloudflare.com          │
│                                                    │
└────────────────────────────────────────────────────┘

Extensions are being served from: dist
Watching for changes...
```

**Developer Experience**:
```javascript
// 1. Edit extension code
// extensions/nudun-messaging-engine/src/Checkout.jsx

// 2. Save file (Ctrl+S)

// 3. Console shows:
// ✓ Extension rebuilding...
// ✓ Extension built in 234ms
// ✓ Reload preview to see changes

// 4. Refresh preview URL (extension updated)

// 5. Changes visible immediately
```

---

### 8. Copilot-Driven Extension Development

**Description**: AI-powered development workflow using GitHub Copilot with rich context from `.github/copilot-instructions.md`.

**Acceptance Criteria**:
- [ ] Copilot generates 80%+ accurate extension code from natural language
- [ ] Copilot suggests Shopify approval-compliant patterns
- [ ] Copilot adds error handling and loading states automatically
- [ ] Copilot generates GraphQL queries with proper types
- [ ] Copilot refactors legacy code to modern patterns

**Example Prompts & Results**:

```
Prompt: "Create a countdown timer extension for flash sales that shows hours, minutes, and seconds until sale ends"

Copilot generates:
```
```jsx
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export default async () => {
  render(<CountdownTimer />, document.body);
};

function CountdownTimer() {
  const saleEndTime = shopify?.cart?.attributes?.value?.sale_end_time;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(saleEndTime));
  
  useEffect(() => {
    if (!saleEndTime) return;
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(saleEndTime));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [saleEndTime]);
  
  if (!saleEndTime || timeLeft.total <= 0) return null;
  
  return (
    <s-banner tone="critical">
      <s-heading>⏰ Flash Sale Ending Soon!</s-heading>
      <s-text>
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s remaining
      </s-text>
    </s-banner>
  );
}

function calculateTimeLeft(endTime) {
  const total = Date.parse(endTime) - Date.now();
  return {
    total,
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60)
  };
}
```

```
Prompt: "Add error handling and loading states to this GraphQL query"

Copilot refactors:
```
```typescript
// Before
const products = await admin.graphql(QUERY);
return products.data;

// After (Copilot-enhanced)
export async function getProducts({ admin }) {
  try {
    const response = await admin.graphql(QUERY);
    
    if (!response.ok) {
      console.error('GraphQL request failed:', response.status);
      return { products: [], error: 'Failed to fetch products' };
    }
    
    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return { products: [], error: data.errors[0].message };
    }
    
    return {
      products: data.data?.products?.edges?.map(e => e.node) || [],
      error: null
    };
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    return { products: [], error: 'An unexpected error occurred' };
  }
}
```

---

## Core Capabilities (Matched or Improved)

### 9. Seamless Embedded App Navigation

**Status**: ✅ Implemented

**Technical Details**:
- Uses `<s-link href="/path">` for all navigation
- App Bridge handles iframe communication
- No `<a>` tags that break session context
- `redirect` from `authenticate.admin()` for server redirects

**Code Example**:
```jsx
// ✅ Correct navigation
<s-link href="/app/rules">View Rules</s-link>

// ✅ Correct programmatic redirect
const { redirect } = await authenticate.admin(request);
return redirect('/app/dashboard');

// ❌ Wrong - breaks iframe
<a href="/app/rules">View Rules</a>

// ❌ Wrong - doesn't work in embedded context
return redirect('/app/dashboard'); // React Router redirect
```

---

### 10. Secure Admin & Webhook Auth Patterns

**Status**: ✅ Implemented

**Security Features**:
- All admin routes use `authenticate.admin()`
- Webhook HMAC verification with `authenticate.webhook()`
- Session tokens validated automatically
- CSRF protection built-in to App Bridge
- No credentials in client-side code

**Code Example**:
```typescript
// Admin route authentication
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Now safe to use admin API
  const response = await admin.graphql(QUERY);
  return json({ data: await response.json() });
};

// Webhook authentication
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shop, session, topic, payload } = await authenticate.webhook(request);
    
    // Webhook verified, process payload
    console.log(`Webhook ${topic} from ${shop}`);
    
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Webhook verification failed');
    return new Response('Unauthorized', { status: 401 });
  }
};
```

---

### 11-16. Other Core Capabilities

See main documentation for details on:
- Prisma-backed Session Storage
- GraphQL Codegen & Fragments
- Comprehensive Error Boundaries
- Multi-env Config via TOML Overrides
- Polaris Web Components Everywhere
- Dev Server Tunnels & Preview URLs

---

## Technical Architecture

### System Diagram

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Merchant Admin (Embedded App)                  │
│  ┌──────────────────────────────────┐          │
│  │  React Router 7 + Polaris Web    │          │
│  │  - Rule Builder UI               │          │
│  │  - Analytics Dashboard           │          │
│  │  - Settings Panel                │          │
│  └──────────────────────────────────┘          │
│              │                                  │
│              │ GraphQL Admin API                │
│              ▼                                  │
│  ┌──────────────────────────────────┐          │
│  │  Shopify App Backend             │          │
│  │  - Authentication                │          │
│  │  - Rule Engine API               │          │
│  │  - Analytics API                 │          │
│  │  - Webhook Handlers              │          │
│  └──────────────────────────────────┘          │
│              │                                  │
│              │ Prisma ORM                       │
│              ▼                                  │
│  ┌──────────────────────────────────┐          │
│  │  Database (PostgreSQL)           │          │
│  │  - Merchant Rules                │          │
│  │  - Custom Attributes             │          │
│  │  - Analytics Events              │          │
│  │  - Session Storage               │          │
│  └──────────────────────────────────┘          │
│                                                 │
└─────────────────────────────────────────────────┘
                     │
                     │ Extension API
                     ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Customer Checkout (Extension)                  │
│  ┌──────────────────────────────────┐          │
│  │  Preact + Polaris Web Components │          │
│  │  - Dynamic Messaging             │          │
│  │  - Subscription Intelligence     │          │
│  │  - Custom Attributes             │          │
│  │  - Analytics Tracking            │          │
│  └──────────────────────────────────┘          │
│              │                                  │
│              │ shopify.* global API             │
│              ▼                                  │
│  ┌──────────────────────────────────┐          │
│  │  Shopify Checkout Data           │          │
│  │  - Cart (lines, totals, etc.)    │          │
│  │  - Customer                      │          │
│  │  - Shipping Address              │          │
│  │  - Discount Codes                │          │
│  └──────────────────────────────────┘          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **Merchant Configuration**:
   - Merchant logs into embedded app
   - Creates rules, custom attributes, analytics settings
   - Data saved to PostgreSQL via Prisma
   - Changes sync to extension via API

2. **Checkout Runtime**:
   - Customer loads checkout
   - Extension fetches merchant rules from API
   - Extension evaluates rules against cart context
   - Extension renders matching messages/components
   - Extension tracks analytics events

3. **Analytics Pipeline**:
   - Extension captures checkout events
   - Events batched and sent to backend API
   - Backend streams to merchant's analytics platform
   - Merchant views analytics in admin dashboard

---

## API Specifications

### REST API Endpoints

```typescript
// Rules Management
GET    /api/rules              // List all rules
POST   /api/rules              // Create rule
GET    /api/rules/:id          // Get single rule
PUT    /api/rules/:id          // Update rule
DELETE /api/rules/:id          // Delete rule
GET    /api/rules/evaluate     // Get active rule for context

// Custom Attributes
GET    /api/attributes         // List all attributes
POST   /api/attributes         // Create attribute
PUT    /api/attributes/:id     // Update attribute
DELETE /api/attributes/:id     // Delete attribute

// Analytics
POST   /api/analytics/event    // Track single event
POST   /api/analytics/batch    // Track multiple events
GET    /api/analytics/summary  // Get analytics summary
GET    /api/analytics/export   // Export analytics data

// Settings
GET    /api/settings           // Get merchant settings
PUT    /api/settings           // Update merchant settings
```

### GraphQL Admin API Queries

```graphql
# Get product details with metafields
query GetProductDetails($id: ID!) {
  product(id: $id) {
    id
    title
    description
    tags
    sellingPlanGroups(first: 10) {
      edges {
        node {
          id
          name
          sellingPlans(first: 10) {
            edges {
              node {
                id
                name
                description
              }
            }
          }
        }
      }
    }
    metafield(namespace: "custom", key: "subscription_benefits") {
      value
    }
  }
}

# Update cart attributes
mutation UpdateCartAttributes($cartId: ID!, $attributes: [AttributeInput!]!) {
  cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
    cart {
      id
      attributes {
        key
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

---

## Performance Requirements

### Bundle Size Targets

| Asset | Target | Max | Current |
|-------|--------|-----|---------|
| Extension JS | 35KB | 50KB | 38KB |
| Extension CSS | 3KB | 5KB | 2.8KB |
| Admin App JS | 150KB | 200KB | 165KB |
| Admin App CSS | 20KB | 30KB | 18KB |

### Performance Metrics

| Metric | Target | Max |
|--------|--------|-----|
| First Contentful Paint (FCP) | < 800ms | 1s |
| Time to Interactive (TTI) | < 1.2s | 1.5s |
| Largest Contentful Paint (LCP) | < 1.5s | 2s |
| Cumulative Layout Shift (CLS) | < 0.05 | 0.1 |
| First Input Delay (FID) | < 50ms | 100ms |
| Extension Initial Render | < 100ms | 150ms |

### API Response Times

| Endpoint | Target | Max |
|----------|--------|-----|
| GET /api/rules/evaluate | < 50ms | 100ms |
| POST /api/analytics/event | < 20ms | 50ms |
| GET /api/rules | < 100ms | 200ms |
| POST /api/rules | < 150ms | 300ms |

---

## Security & Compliance

### GDPR Compliance

- [ ] Privacy policy published and accessible
- [ ] Cookie consent (if using analytics cookies)
- [ ] Data deletion on merchant uninstall
- [ ] Customer data deletion on request
- [ ] No PII in analytics without consent
- [ ] Data processing agreements in place

### Security Requirements

- [ ] All API endpoints require authentication
- [ ] HTTPS only (no HTTP)
- [ ] CSRF protection on all mutations
- [ ] Input validation on all merchant inputs
- [ ] SQL injection prevention (Prisma prepared statements)
- [ ] XSS prevention (React/Preact escaping)
- [ ] Rate limiting on API endpoints
- [ ] Webhook HMAC verification
- [ ] Session token validation

### Shopify Approval Requirements

See `SHOPIFY-APPROVAL-CHECKLIST.md` for complete requirements.

---

## Implementation Timeline

### Phase 1: Foundation (✅ COMPLETE - 2 weeks)
- [x] App scaffolding with React Router 7
- [x] Extension rendering with Preact JSX
- [x] Store connection and authentication
- [x] Development environment setup
- [x] Documentation and compliance baseline

### Phase 2A: Dynamic Messaging (4 weeks)
- [ ] Week 1: Rule builder UI in admin
- [ ] Week 2: Rule evaluation engine in extension
- [ ] Week 3: Message interpolation and analytics
- [ ] Week 4: Testing and polish

### Phase 2B: Subscription Intelligence (2 weeks)
- [ ] Week 1: Subscription detection and pricing calc
- [ ] Week 2: Benefits display and testing

### Phase 3: Analytics & Tracking (3 weeks)
- [ ] Week 1: Event tracking system
- [ ] Week 2: Analytics dashboard UI
- [ ] Week 3: Privacy controls and export

### Phase 4: Advanced Features (4 weeks)
- [ ] Week 1: Custom attribute system
- [ ] Week 2: Advanced i18n
- [ ] Week 3: Performance optimization
- [ ] Week 4: A/B testing framework

### Phase 5: Launch Prep (3 weeks)
- [ ] Week 1: Security audit and fixes
- [ ] Week 2: Comprehensive testing
- [ ] Week 3: Shopify app submission

**Total Timeline**: ~18 weeks (4.5 months)

---

## Success Metrics

### Technical KPIs
- Extension bundle size < 50KB
- Lighthouse score > 95
- API response time < 100ms (p95)
- 99.9% uptime
- Zero critical security vulnerabilities

### Business KPIs
- 50+ active merchants within 6 months
- Average AOV increase of 15%+ for merchants
- 5% reduction in cart abandonment
- 4.5+ star rating on Shopify App Store
- 90%+ merchant retention rate

---

**Document Version**: 1.0.0  
**Last Updated**: October 7, 2025  
**Next Review**: November 7, 2025
