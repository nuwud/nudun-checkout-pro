/**
 * Subscription keyword detection dedicated to glassware messaging.
 *
 * Looks for subscription-related keywords in product and variant titles
 * to determine whether a cart line includes complimentary glassware.
 *
 * Detection priority:
 * 1. Annual subscriptions (4 glasses)
 * 2. Quarterly subscriptions (1 glass)
 * 3. Generic subscription keyword (1 glass)
 *
 * @module subscriptionDetection
 */

/**
 * @typedef {'bold' | 'keyword' | null} SubscriptionProvider
 * @typedef {'annual' | 'quarterly' | 'subscription' | null} SubscriptionInterval
 * @typedef {Object} SubscriptionDetectionResult
 * @property {boolean} isSubscription - True when subscription keywords are detected
 * @property {number} glassCount - Complimentary glass count based on subscription type
 * @property {'annual' | 'quarterly' | 'subscription'} interval - Matched subscription keyword
 * @property {SubscriptionProvider} provider - Which provider detected this subscription
 * @property {Record<string, unknown>} metadata - Provider-specific metadata
 */

const DETECTION_ORDER = [
  {
    type: 'annual',
    glassCount: 4,
    patterns: [/\bannual\b/i, /\byearly\b/i, /\b12\s*-?\s*month\b/i]
  },
  {
    type: 'quarterly',
    glassCount: 1,
    patterns: [/\bquarterly\b/i, /\b3\s*-?\s*month\b/i]
  },
  {
    type: 'subscription',
    glassCount: 1,
    patterns: [/\bsubscription\b/i]
  }
];

const DEFAULT_RESULT = Object.freeze({
  isSubscription: false,
  glassCount: 0,
  interval: null,
  provider: null,
  metadata: {}
});

/**
 * Extract searchable text from a Shopify cart line item.
 *
 * @param {unknown} lineItem - Shopify checkout line item
 * @returns {string} Combined text from relevant title fields
 */
function buildSearchText(lineItem) {
  if (!lineItem || typeof lineItem !== 'object') {
    return '';
  }

  /** @type {Record<string, unknown>} */
  const item = lineItem;

  const candidates = [
    item.title,
    item?.merchandise?.title,
    item?.merchandise?.product?.title
  ];

  return candidates
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .join(' ');
}

/**
 * Detect subscription keywords on a cart line item.
 *
 * @param {unknown} lineItem - Shopify checkout line item
 * @returns {SubscriptionDetectionResult} Detection result with best-match priority
 *
 * @example
 * const result = detectSubscription({ title: 'Annual Coffee Subscription' });
 * // result => { isSubscription: true, glassCount: 4, subscriptionType: 'annual' }
 *
 * @example
 * const result = detectSubscription({ merchandise: { title: 'Quarterly Blend' } });
 * // result => { isSubscription: true, glassCount: 1, subscriptionType: 'quarterly' }
 */
export function detectSubscription(lineItem) {
  const haystack = buildSearchText(lineItem);

  if (!haystack) {
    return DEFAULT_RESULT;
  }

  for (const definition of DETECTION_ORDER) {
    if (definition.patterns.some((pattern) => pattern.test(haystack))) {
      return {
        isSubscription: true,
        glassCount: definition.glassCount,
        interval: definition.type,
        provider: 'keyword',
        metadata: {}
      };
    }
  }

  return DEFAULT_RESULT;
}

/**
 * Safely expose detection helpers for tests.
 *
 * @internal
 */
export const _internals = {
  DETECTION_ORDER,
  buildSearchText
};
    try {
      const response = await shopifyAPI.query({
        data: {
          query: `#graphql
            query GlassProductPrice($handle: String!) {
              product(handle: $handle) {
                variants(first: 1) {
                  nodes {
                    price {
                      amount
                      currencyCode
                    }
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          `,
          variables: {
            handle: GLASS_PRODUCT_HANDLE
          }
        }
      });

      const payload = response?.data ?? (typeof response?.json === 'function' ? await response.json() : response);
      const price = extractVariantPrice(payload ?? {});

      if (!price) {
        cachedResult = DEFAULT_RESULT;
        return cachedResult;
      }

      cachedResult = {
        price,
        found: true
      };
      return cachedResult;
    } catch (error) {
      cachedResult = DEFAULT_RESULT;
      return cachedResult;
    } finally {
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

/**
 * Reset the lookup cache. Intended for unit tests.
 */
export function resetGlassProductCache() {
  cachedResult = null;
  inflightRequest = null;
}

/**
 * Expose internals for testing without relying on globals.
 *
 * @internal
 */
export const _internals = {
  normalizePrice,
  extractVariantPrice,
  DEFAULT_RESULT,
  GLASS_PRODUCT_HANDLE
};
