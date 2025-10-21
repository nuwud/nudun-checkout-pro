import { describe, expect, it } from 'vitest';
import { detectSubscription, _internals } from '../src/utils/subscriptionDetection.js';

const { buildSearchText } = _internals;

describe('subscriptionDetection', () => {
  it('returns default result when line item is null', () => {
    expect(detectSubscription(null)).toEqual({
      isSubscription: false,
      glassCount: 0,
      interval: null,
      provider: null,
      metadata: {}
    });
  });

  it('returns default result when no subscription keywords exist', () => {
    const result = detectSubscription({ title: 'House Blend Coffee Beans' });
    expect(result).toEqual({
      isSubscription: false,
      glassCount: 0,
      interval: null,
      provider: null,
      metadata: {}
    });
  });

  it('detects quarterly subscriptions regardless of casing', () => {
    const lower = detectSubscription({ title: 'quarterly coffee club' });
    const upper = detectSubscription({ title: 'QUARTERLY TEA BOX' });
    const mixed = detectSubscription({ title: 'Quarterly Espresso Plan' });

    for (const result of [lower, upper, mixed]) {
      expect(result).toEqual({
        isSubscription: true,
        glassCount: 1,
        interval: 'quarterly',
        provider: 'keyword',
        metadata: {}
      });
    }
  });

  it('detects quarterly keyword in variant title', () => {
    const result = detectSubscription({
      merchandise: { title: 'Roaster Club - Quarterly Shipment' }
    });

    expect(result).toEqual({
      isSubscription: true,
      glassCount: 1,
      interval: 'quarterly',
      provider: 'keyword',
      metadata: {}
    });
  });

  it('detects annual subscriptions with correct glass count', () => {
    const result = detectSubscription({ title: 'Annual Coffee Subscription' });
    expect(result).toEqual({
      isSubscription: true,
      glassCount: 4,
      interval: 'annual',
      provider: 'keyword',
      metadata: {}
    });
  });

  it('prioritizes annual when annual and quarterly keywords appear', () => {
    const result = detectSubscription({ title: 'Annual Quarterly Bundle' });
    expect(result).toEqual({
      isSubscription: true,
      glassCount: 4,
      interval: 'annual',
      provider: 'keyword',
      metadata: {}
    });
  });

  it('detects annual keyword in product title', () => {
    const result = detectSubscription({
      merchandise: {
        product: { title: 'Premium Annual Box' }
      }
    });

    expect(result).toEqual({
      isSubscription: true,
      glassCount: 4,
      interval: 'annual',
      provider: 'keyword',
      metadata: {}
    });
  });

  it('detects 12-month phrasing as annual', () => {
    const result = detectSubscription({ title: '12 month VIP subscription' });
    expect(result).toEqual({
      isSubscription: true,
      glassCount: 4,
      interval: 'annual',
      provider: 'keyword',
      metadata: {}
    });
  });

  it('detects generic subscription keyword when specific interval missing', () => {
    const result = detectSubscription({ title: 'Coffee Subscription Box' });
    expect(result).toEqual({
      isSubscription: true,
      glassCount: 1,
      interval: 'subscription',
      provider: 'keyword',
      metadata: {}
    });
  });

  it('handles non-string title values gracefully', () => {
    const result = detectSubscription({ title: 12345 });
    expect(result).toEqual({
      isSubscription: false,
      glassCount: 0,
      interval: null,
      provider: null,
      metadata: {}
    });
  });

  it('builds search text from multiple title sources', () => {
    const haystack = buildSearchText({
      title: 'Primary',
      merchandise: {
        title: 'Variant',
        product: { title: 'Product' }
      }
    });

    expect(haystack).toBe('Primary Variant Product');
  });

  it('ignores blank titles while building search text', () => {
    const haystack = buildSearchText({
      title: '  ',
      merchandise: { title: 'Quarterly Deluxe' }
    });

    expect(haystack).toBe('Quarterly Deluxe');
  });

  it('matches quarterly using 3 month phrasing', () => {
    const result = detectSubscription({ title: '3-month supply subscription' });
    expect(result).toEqual({
      isSubscription: true,
      glassCount: 1,
      interval: 'quarterly',
      provider: 'keyword',
      metadata: {}
    });
  });
});
