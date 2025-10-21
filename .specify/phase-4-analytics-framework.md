# Phase 4: Analytics & A/B Testing Framework

**Status**: Planning  
**Start Date**: October 21, 2025  
**Target Duration**: 3 weeks (T013-T030)  
**Dependencies**: Phase 3 (GlasswareMessage) - COMPLETE ✅

---

## Overview

Phase 4 builds the analytics and experimentation infrastructure that powers NUDUN Checkout Pro's competitive advantage. After validating the GlasswareMessage component in Phase 3, we now instrument checkout for data collection and enable merchants to run A/B tests.

### Key Deliverables
- **Event Tracking System**: Capture checkout interactions (impressions, clicks, conversions)
- **Analytics Dashboard**: Real-time visualization of engagement metrics by segment
- **A/B Testing Framework**: Easy configuration for message variants and audience targeting
- **Advanced Personalization**: Context-aware messaging based on customer attributes
- **Performance Insights**: Server-side and client-side benchmarking

---

## User Stories

### US8: Behavioral Event Tracking
**As a** metrics engineer  
**I want to** capture granular checkout events  
**So that** we can measure engagement and optimize conversion funnels

**Acceptance Criteria**:
- ✅ Track impression events when banners render (banner ID, variant, audience segment)
- ✅ Track click events when users interact with CTAs (button ID, action, timestamp)
- ✅ Track conversion events at checkout completion (session ID, cart value, attribution)
- ✅ Track abandonment events when cart is cleared/abandoned
- ✅ Events are privacy-compliant (no PII, respects GDPR)
- ✅ Events batch and send asynchronously (no blocking)
- ✅ Events include context: checkout phase, device type, locale, currency

**Example Event Schema**:
```json
{
  "eventType": "banner_impression",
  "bannerId": "glassware-annual-v1",
  "variant": "control",
  "audience": "existing_customers",
  "cartValue": "125.50",
  "currency": "USD",
  "timestamp": "2025-10-21T12:34:56Z",
  "sessionId": "sess_abc123",
  "device": "mobile",
  "locale": "en-US",
  "checkoutPhase": "shipping_address"
}
```

### US9: Real-Time Analytics Dashboard
**As a** merchant  
**I want to** see engagement metrics in real-time  
**So that** I can optimize messaging without waiting for reports

**Acceptance Criteria**:
- ✅ Dashboard shows impressions, clicks, click-through rate (CTR), conversion rate
- ✅ Breakdown by subscription type (annual, quarterly, generic), message variant, device
- ✅ Time-series graphs for last 24h, 7d, 30d periods
- ✅ Audience segments: new vs returning, VIP vs standard, geography
- ✅ Live event stream: see events as they happen (last 100 events)
- ✅ Export data as CSV for external analysis
- ✅ Responsive design: desktop, tablet, mobile
- ✅ Performance: dashboard loads in <2s, updates every 5s

**Dashboard Layout**:
- Header: Store name, date range selector, export button
- KPI Cards: Impressions, Clicks, CTR, Conversion Rate, Revenue Impact
- Charts: Impressions over time, CTR by variant, Device breakdown
- Segments Table: By subscription type, audience, geography
- Live Event Stream: Real-time feed of recent events

### US10: A/B Testing Framework
**As a** product manager  
**I want to** easily configure message variants for A/B testing  
**So that** I can optimize messaging based on performance data

**Acceptance Criteria**:
- ✅ No-code interface to create variants (50% control, 50% treatment)
- ✅ Support for multiple variant types: text, banner tone, button label, emoji, icon
- ✅ Automatic traffic split with deterministic session hashing
- ✅ Scheduled tests: start/end dates, auto-pause underperforming variants
- ✅ Statistical significance calculator: show when result is confident
- ✅ Variant performance comparison: show improvement over control (CTR, conversion)
- ✅ Auto-scale: increase traffic to winning variant during test
- ✅ Rollback capability: revert to previous variant if issues detected

**Test Creation Workflow**:
1. Create test: "Glassware Messaging - Annual Variant Test"
2. Configure control: Original message (50% traffic)
3. Configure treatment: "🎉 Save $100 with annual subscription"  (50% traffic)
4. Target audience: Existing customers, quarterly → annual upsell
5. Schedule: Oct 21 - Oct 28 (7 days)
6. Success metric: Clicks on upgrade button
7. Launch & monitor: See results update daily

### US11: Advanced Personalization
**As a** content strategist  
**I want to** customize messages based on customer context  
**So that** we can increase relevance and conversion

**Acceptance Criteria**:
- ✅ Show different messages to new vs returning customers
- ✅ Personalize by subscription type: annual gets different message than quarterly
- ✅ Geography-based messaging: show local payment methods, tax info
- ✅ VIP program members get exclusive benefits messaging
- ✅ Cart value-based thresholds: different message if >$100 vs <$50
- ✅ Customer LTV segmentation: high-value customers get premium offers
- ✅ Weather-based messaging: seasonal promotions for climate-specific products
- ✅ Rules engine: simple AND/OR conditions without code

**Example Personalization Rule**:
```
If (subscription_type == "annual" AND customer_lifetime_value > $500) {
  show_banner("premium_vip_offer");
} else if (subscription_type == "quarterly") {
  show_banner("upgrade_to_annual");
} else {
  show_banner("subscribe_now");
}
```

---

## Technical Architecture

### Event Collection Stack
```
Checkout Extension (Preact)
    ↓ shopify.analytics.publish()
    ↓ (batch & queue)
    ↓
Event Queue (sessionStorage)
    ↓ async POST
    ↓
API Endpoint: /api/checkout/events
    ↓
Database: events table (Prisma)
    ↓
Analytics Service (background jobs)
    ↓
Real-time Dashboard (WebSocket)
```

### Data Schema (Prisma)
```prisma
model CheckoutEvent {
  id              String    @id @default(cuid())
  eventType       String    // impression, click, conversion, abandonment
  bannerId        String
  variant         String
  audience        String
  cartValue       Decimal
  currency        String
  sessionId       String
  shopId          String
  checkoutPhase   String
  device          String    // mobile, desktop, tablet
  locale          String
  timestamp       DateTime  @default(now())
  createdAt       DateTime  @default(now())
  
  @@index([shopId, timestamp])
  @@index([bannerId, variant])
  @@index([sessionId])
}

model ABTest {
  id              String    @id @default(cuid())
  shopId          String
  name            String    // "Glassware Annual Variant Test"
  bannerId        String
  control         String    // Control variant ID
  treatment       String    // Treatment variant ID
  trafficSplit    Int       // 50 (50% to each)
  audience        String    // Targeting criteria
  startDate       DateTime
  endDate         DateTime
  successMetric   String    // impressions, clicks, conversion
  status          String    // draft, running, paused, completed
  createdAt       DateTime  @default(now())
  
  @@index([shopId, status])
}

model AnalyticsMetric {
  id              String    @id @default(cuid())
  shopId          String
  bannerId        String
  variant         String
  date            DateTime
  impressions     Int       @default(0)
  clicks          Int       @default(0)
  conversions     Int       @default(0)
  revenue         Decimal   @default(0)
  device          String
  
  @@unique([shopId, bannerId, variant, date, device])
  @@index([shopId, date])
}
```

### Frontend Event Tracking Hook
```javascript
// hooks/useCheckoutAnalytics.js
function useCheckoutAnalytics() {
  const trackEvent = useCallback((eventType, properties) => {
    // Get context from shopify global
    const context = {
      sessionId: shopify.sessionToken,
      locale: shopify.localization.value?.isoCode,
      device: getDeviceType(),
      checkoutPhase: getCheckoutPhase(),
      cartValue: shopify.cost.totalAmount.value?.amount,
      currency: shopify.cost.totalAmount.value?.currencyCode
    };
    
    // Queue event for batching
    const event = { eventType, ...properties, ...context, timestamp: Date.now() };
    queueEvent(event);
    
    // Send when queue reaches threshold or on interval
  }, []);
  
  return { trackEvent };
}
```

### API Endpoint: POST /api/checkout/events
```typescript
// app/routes/api/checkout/events.tsx
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 });
  
  const events = await request.json();
  const shopId = request.headers.get('X-Shop-ID');
  
  // Validate and normalize events
  const normalized = events.map(e => ({
    ...e,
    shopId,
    timestamp: new Date(e.timestamp)
  }));
  
  // Batch insert into database
  await prisma.checkoutEvent.createMany({ data: normalized });
  
  // Trigger analytics aggregation
  scheduleAnalyticsJob(shopId);
  
  return json({ success: true, count: events.length });
};
```

### Analytics Aggregation Job
```typescript
// Runs hourly to aggregate metrics
async function aggregateMetrics(shopId: string, date: Date) {
  const events = await prisma.checkoutEvent.findMany({
    where: {
      shopId,
      timestamp: {
        gte: startOfDay(date),
        lte: endOfDay(date)
      }
    }
  });
  
  // Group by bannerId, variant, device
  const groups = groupBy(events, e => `${e.bannerId}|${e.variant}|${e.device}`);
  
  // Upsert metrics
  for (const [key, items] of Object.entries(groups)) {
    const [bannerId, variant, device] = key.split('|');
    await prisma.analyticsMetric.upsert({
      where: { shopId_bannerId_variant_date_device: { shopId, bannerId, variant, date, device } },
      create: { shopId, bannerId, variant, date, device, impressions: items.length },
      update: { impressions: items.length }
    });
  }
}
```

---

## Implementation Roadmap

### T013-T015: Event Tracking Infrastructure (1 week)
- [ ] T013: Design event schema and validate with metrics team
- [ ] T014: Implement checkout event tracking hook (useCheckoutAnalytics)
- [ ] T015: Create API endpoint for event ingestion (/api/checkout/events)

### T016-T018: Analytics Storage & Aggregation (1 week)
- [ ] T016: Implement Prisma migrations (CheckoutEvent, AnalyticsMetric models)
- [ ] T017: Create analytics aggregation job (hourly metrics rollup)
- [ ] T018: Build query service for dashboard data retrieval

### T019-T021: Analytics Dashboard (1 week)
- [ ] T019: Create admin route for analytics dashboard
- [ ] T020: Implement KPI cards and time-series charts
- [ ] T021: Build live event stream and event details modal

### T022-T024: A/B Testing Framework (1 week)
- [ ] T022: Implement A/B test configuration form
- [ ] T023: Create variant traffic splitting logic (deterministic hashing)
- [ ] T024: Build test performance comparison UI

### T025-T027: Advanced Personalization (1 week)
- [ ] T025: Implement rules engine for context-based messaging
- [ ] T026: Create merchant UI for rule configuration (no-code)
- [ ] T027: Add audience segmentation and targeting

### T028-T030: Testing & Optimization (1 week)
- [ ] T028: Write integration tests for event tracking
- [ ] T029: Load testing: 1M+ events/hour sustained throughput
- [ ] T030: Performance tuning, security audit, Shopify compliance check

---

## Success Metrics

### Adoption
- ✅ 80%+ of merchants create at least one A/B test
- ✅ 95%+ event delivery rate (no data loss)
- ✅ <5s event latency (from checkout to dashboard)

### Performance
- ✅ Analytics dashboard loads in <2s
- ✅ Event ingestion: <50ms per batch
- ✅ Aggregation job: <10s per hour
- ✅ Support 1M+ events/hour sustained

### Business Impact
- ✅ +15% average CTR improvement through A/B testing
- ✅ +8% conversion rate improvement through personalization
- ✅ Average test runtime reduced from 2 weeks → 4 days

---

## Risk Mitigation

### Data Privacy & Compliance
- **Risk**: Collecting customer data without consent
- **Mitigation**: 
  - No PII collection (no email, phone, address)
  - Session-based attribution only
  - Comply with GDPR (allow data deletion)
  - Audit event data quarterly

### Database Scalability
- **Risk**: Event table grows too large (millions/month)
- **Mitigation**:
  - Partition by shop_id and date
  - Archive events >90 days old to S3
  - Index on frequently queried fields
  - Monitor query performance monthly

### Analytics Accuracy
- **Risk**: Traffic split not truly 50/50, affecting test results
- **Mitigation**:
  - Use deterministic session hashing (consistent variant assignment)
  - Validate split distribution monthly
  - Statistical significance calculator before acting on results

---

## Dependencies & Prerequisites

### Required
- ✅ Phase 3 GlasswareMessage component (already deployed)
- ✅ Shopify extension infrastructure (already established)
- ✅ Prisma database setup (schema in place)

### External Services (Optional but Recommended)
- Analytics Platform: Segment, Mixpanel, or custom BI tool
- Webhooks: Send events to external analytics for historical analysis
- Alerting: Slack notifications for anomalies

---

## Open Questions & Decisions

1. **Event Retention**: How long to keep raw events before archiving?
   - Proposal: 90 days raw, 13 months aggregated metrics
   
2. **Real-time Updates**: WebSocket vs polling for dashboard?
   - Proposal: Polling every 5s (simpler, sufficient for initial launch)
   
3. **Statistical Significance**: Use Bayesian or frequentist approach?
   - Proposal: Frequentist (chi-square) for simplicity, consider Bayesian v2

4. **Export Format**: Just CSV or also API access?
   - Proposal: CSV for phase 4, API in phase 5

---

## References

- [Shopify Analytics Best Practices](https://shopify.dev/docs)
- [A/B Testing Guide](https://en.wikipedia.org/wiki/A/B_testing)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Analytics Data Warehouse Design](https://en.wikipedia.org/wiki/Data_warehouse)
