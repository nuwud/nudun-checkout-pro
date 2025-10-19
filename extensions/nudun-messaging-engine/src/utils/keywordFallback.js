/**
 * Keyword Fallback for v1.0 Compatibility
 * 
 * Detects subscription type from product title/variant title using keywords.
 * Used as fallback when metafield 'custom.subscription_type' is missing.
 * 
 * Related: T007 - Create keyword fallback
 * User Story: US5 - Generic Add-On System (backward compatibility)
 */

/**
 * @typedef {Object} KeywordMatch
 * @property {string} interval - Detected interval ('quarterly', 'annual', 'monthly')
 * @property {number} count - Detected glass count (default: 1 for quarterly, 4 for annual)
 * @property {string} addonType - Add-on type ('glass' by default)
 * @property {string} source - Source of detection ('title', 'variant', 'keyword')
 */

/**
 * Keyword patterns for subscription detection
 */
const KEYWORD_PATTERNS = {
  quarterly: [
    /\bquarterly\b/i,
    /\b3[-\s]?month/i,
    /\bevery[-\s]?3[-\s]?months?\b/i
  ],
  annual: [
    /\bannual/i,
    /\byearly\b/i,
    /\b12[-\s]?month/i,
    /\bevery[-\s]?year\b/i
  ],
  monthly: [
    /\bmonthly\b/i,
    /\b1[-\s]?month/i,
    /\bevery[-\s]?month\b/i
  ]
};

/**
 * Glass count mapping based on interval
 * (Legacy v1.0 logic: quarterly = 1 glass, annual = 4 glasses)
 */
const DEFAULT_GLASS_COUNTS = {
  monthly: 1,
  quarterly: 1,
  annual: 4
};

/**
 * Detect subscription interval from text using keywords
 * 
 * @param {string} text - Product title or variant title
 * @returns {string|null} Detected interval or null
 * 
 * @example
 * detectIntervalFromKeywords('Quarterly Wine Subscription');  // 'quarterly'
 * detectIntervalFromKeywords('Annual Membership');            // 'annual'
 * detectIntervalFromKeywords('Regular Wine Bottle');          // null
 */
export function detectIntervalFromKeywords(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const lowerText = text.toLowerCase();

  // Check each interval's patterns
  for (const [interval, patterns] of Object.entries(KEYWORD_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        return interval;
      }
    }
  }

  return null;
}

/**
 * Extract glass count from text
 * 
 * Looks for patterns like "4 glasses", "2-glass", "1 glass per quarter"
 * 
 * @param {string} text - Product title or description
 * @returns {number|null} Detected count or null
 * 
 * @example
 * extractGlassCount('4 Premium Glasses');     // 4
 * extractGlassCount('2-glass subscription');  // 2
 * extractGlassCount('Wine Club');             // null
 */
export function extractGlassCount(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Pattern: "N glass" or "N glasses" or "N-glass"
  const countPatterns = [
    /(\d+)[-\s]?glasses?\b/i,
    /\b(\d+)\s+glass/i
  ];

  for (const pattern of countPatterns) {
    const match = text.match(pattern);
    if (match) {
      const count = parseInt(match[1], 10);
      if (!isNaN(count) && count > 0) {
        return count;
      }
    }
  }

  return null;
}

/**
 * Detect subscription from product title using keywords (v1.0 logic)
 * 
 * @param {string} title - Product title
 * @param {string} [variantTitle] - Variant title (optional)
 * @returns {KeywordMatch|null} Detected subscription data or null
 * 
 * @example
 * // v1.0 quarterly detection
 * detectSubscriptionFromKeywords('Quarterly Wine Subscription')
 * // Returns: { interval: 'quarterly', count: 1, addonType: 'glass', source: 'title' }
 * 
 * @example
 * // v1.0 annual detection
 * detectSubscriptionFromKeywords('Annual Wine Club - 4 Glasses')
 * // Returns: { interval: 'annual', count: 4, addonType: 'glass', source: 'title' }
 */
export function detectSubscriptionFromKeywords(title, variantTitle = null) {
  // Try title first
  const titleInterval = detectIntervalFromKeywords(title);
  const titleCount = extractGlassCount(title);

  if (titleInterval) {
    return {
      interval: titleInterval,
      count: titleCount || DEFAULT_GLASS_COUNTS[titleInterval],
      addonType: 'glass', // v1.0 always assumed glass
      source: 'title'
    };
  }

  // Try variant title as fallback
  if (variantTitle) {
    const variantInterval = detectIntervalFromKeywords(variantTitle);
    const variantCount = extractGlassCount(variantTitle);

    if (variantInterval) {
      return {
        interval: variantInterval,
        count: variantCount || DEFAULT_GLASS_COUNTS[variantInterval],
        addonType: 'glass',
        source: 'variant'
      };
    }
  }

  return null;
}

/**
 * Detect subscription from line item using keyword fallback
 * 
 * @param {Object} lineItem - Shopify cart line item
 * @returns {KeywordMatch|null} Detected subscription or null
 * 
 * @example
 * const subscription = detectLineItemKeywords(lineItem);
 * if (subscription) {
 *   console.log(`Detected ${subscription.interval} subscription via ${subscription.source}`);
 * }
 */
export function detectLineItemKeywords(lineItem) {
  try {
    const product = lineItem?.merchandise?.product;
    const variant = lineItem?.merchandise;

    const productTitle = product?.title || '';
    const variantTitle = variant?.title || '';

    return detectSubscriptionFromKeywords(productTitle, variantTitle);
  } catch (error) {
    console.error('[KeywordFallback] Error detecting keywords:', error);
    return null;
  }
}

/**
 * Check if line item is a subscription (keyword-based)
 * 
 * @param {Object} lineItem - Shopify cart line item
 * @returns {boolean} True if subscription keywords detected
 * 
 * @example
 * if (isSubscriptionByKeywords(lineItem)) {
 *   // Show subscription benefits
 * }
 */
export function isSubscriptionByKeywords(lineItem) {
  return detectLineItemKeywords(lineItem) !== null;
}

/**
 * Get all subscriptions from cart using keyword detection
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @returns {Array<{lineItem: Object, subscription: KeywordMatch}>} Detected subscriptions
 * 
 * @example
 * const subscriptions = getCartSubscriptionsByKeywords(shopify.lines.value);
 * console.log(`Found ${subscriptions.length} subscriptions via keyword detection`);
 */
export function getCartSubscriptionsByKeywords(lines) {
  if (!Array.isArray(lines)) {
    return [];
  }

  const subscriptions = [];

  for (const lineItem of lines) {
    const subscription = detectLineItemKeywords(lineItem);

    if (subscription) {
      subscriptions.push({
        lineItem,
        subscription
      });
    }
  }

  return subscriptions;
}

/**
 * Convert KeywordMatch to SubscriptionData format
 * 
 * Bridges v1.0 keyword detection to v2.0 metafield format.
 * 
 * @param {KeywordMatch} keywordMatch - Detected subscription from keywords
 * @returns {Object} SubscriptionData-compatible object
 * 
 * @example
 * const keywords = detectSubscriptionFromKeywords('Quarterly Subscription');
 * const subscription = convertKeywordToSubscription(keywords);
 * // subscription.addOns = ['glass']
 * // subscription.addOnCounts = { glass: 1 }
 */
export function convertKeywordToSubscription(keywordMatch) {
  if (!keywordMatch) {
    return null;
  }

  return {
    interval: keywordMatch.interval,
    count: keywordMatch.count,
    addOns: [keywordMatch.addonType],
    addOnCounts: {
      [keywordMatch.addonType]: keywordMatch.count
    },
    raw: `keyword:${keywordMatch.source}`,
    source: 'keyword' // Mark as keyword detection (not metafield)
  };
}
