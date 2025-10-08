/**
 * Subscription Detector
 * 
 * Unified subscription detection system with metafield-first strategy.
 * Falls back to keyword detection for v1.0 compatibility.
 * 
 * Detection Priority:
 * 1. Metafield: custom.subscription_type (preferred)
 * 2. Keywords: Product/variant title (fallback)
 * 
 * Related: T008 - Refactor subscription detection (metafield-first)
 * User Story: US5 - Generic Add-On System
 * Requirements: FR-018 (metafield), FR-021 (fallback)
 */

import { parseLineItemSubscription, hasSubscriptionInCart } from './metafieldParser.js';
import { detectLineItemKeywords, convertKeywordToSubscription } from './keywordFallback.js';

/**
 * @typedef {Object} SubscriptionData
 * @property {string} interval - Subscription interval
 * @property {number} count - Primary add-on count
 * @property {string[]} addOns - Array of add-on types
 * @property {Record<string, number>} addOnCounts - Quantity per add-on type
 * @property {string} raw - Original metafield value or keyword source
 * @property {string} [source] - Detection source: 'metafield' or 'keyword'
 */

/**
 * Detect subscription from line item (metafield-first strategy)
 * 
 * Priority:
 * 1. Try metafield parsing (custom.subscription_type)
 * 2. Fall back to keyword detection if metafield missing
 * 
 * @param {Object} lineItem - Shopify cart line item
 * @returns {SubscriptionData|null} Subscription data or null
 * 
 * @example
 * const subscription = detectSubscription(lineItem);
 * if (subscription) {
 *   console.log(`Detected ${subscription.interval} via ${subscription.source}`);
 *   console.log(`Add-ons: ${subscription.addOns.join(', ')}`);
 * }
 */
export function detectSubscription(lineItem) {
  if (!lineItem) {
    return null;
  }

  // Priority 1: Try metafield parsing
  const metafieldResult = parseLineItemSubscription(lineItem);
  if (metafieldResult) {
    return {
      ...metafieldResult,
      source: 'metafield'
    };
  }

  // Priority 2: Fall back to keyword detection
  const keywordResult = detectLineItemKeywords(lineItem);
  if (keywordResult) {
    const converted = convertKeywordToSubscription(keywordResult);
    return {
      ...converted,
      source: 'keyword'
    };
  }

  return null;
}

/**
 * Get all subscriptions from cart
 * 
 * Uses metafield-first strategy for each line item.
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @returns {Array<{lineItem: Object, subscription: SubscriptionData}>} Detected subscriptions
 * 
 * @example
 * const subscriptions = getCartSubscriptions(shopify.lines.value);
 * subscriptions.forEach(({ lineItem, subscription }) => {
 *   console.log(`Line ${lineItem.id}:`);
 *   console.log(`  Interval: ${subscription.interval}`);
 *   console.log(`  Add-ons: ${subscription.addOns.join(', ')}`);
 *   console.log(`  Source: ${subscription.source}`);
 * });
 */
export function getCartSubscriptions(lines) {
  if (!Array.isArray(lines)) {
    return [];
  }

  const subscriptions = [];

  for (const lineItem of lines) {
    const subscription = detectSubscription(lineItem);

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
 * Check if cart has any subscriptions
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @returns {boolean} True if at least one subscription found
 * 
 * @example
 * if (hasSubscriptions(shopify.lines.value)) {
 *   // Show subscription benefits
 * }
 */
export function hasSubscriptions(lines) {
  return getCartSubscriptions(lines).length > 0;
}

/**
 * Get total add-on count across all subscriptions
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @param {string} [addonType] - Optional: filter by add-on type
 * @returns {number} Total count
 * 
 * @example
 * // Total glass count across all subscriptions
 * const glassCount = getTotalAddOnCount(shopify.lines.value, 'glass');
 * 
 * @example
 * // Total count of all add-ons
 * const totalCount = getTotalAddOnCount(shopify.lines.value);
 */
export function getTotalAddOnCount(lines, addonType = null) {
  const subscriptions = getCartSubscriptions(lines);

  let total = 0;

  for (const { subscription } of subscriptions) {
    if (addonType) {
      // Count specific add-on type
      total += subscription.addOnCounts[addonType] || 0;
    } else {
      // Count all add-ons
      for (const count of Object.values(subscription.addOnCounts)) {
        total += count;
      }
    }
  }

  return total;
}

/**
 * Get unique add-on types across all subscriptions
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @returns {string[]} Array of unique add-on types
 * 
 * @example
 * const addonTypes = getUniqueAddOnTypes(shopify.lines.value);
 * // ['glass', 'bottle', 'sticker']
 */
export function getUniqueAddOnTypes(lines) {
  const subscriptions = getCartSubscriptions(lines);
  const types = new Set();

  for (const { subscription } of subscriptions) {
    for (const addonType of subscription.addOns) {
      types.add(addonType);
    }
  }

  return Array.from(types);
}

/**
 * Get subscription by interval
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @param {string} interval - Interval to find ('monthly', 'quarterly', 'annual')
 * @returns {Array<{lineItem: Object, subscription: SubscriptionData}>} Matching subscriptions
 * 
 * @example
 * const quarterlySubscriptions = getSubscriptionsByInterval(shopify.lines.value, 'quarterly');
 */
export function getSubscriptionsByInterval(lines, interval) {
  const allSubscriptions = getCartSubscriptions(lines);

  return allSubscriptions.filter(
    ({ subscription }) => subscription.interval === interval
  );
}

/**
 * Check if cart has specific subscription interval
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @param {string} interval - Interval to check
 * @returns {boolean} True if found
 * 
 * @example
 * if (hasInterval(shopify.lines.value, 'annual')) {
 *   // Show annual subscription benefits
 * }
 */
export function hasInterval(lines, interval) {
  return getSubscriptionsByInterval(lines, interval).length > 0;
}

/**
 * Get detection source statistics
 * 
 * Useful for monitoring metafield adoption vs keyword fallback usage.
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @returns {{metafield: number, keyword: number, total: number}} Statistics
 * 
 * @example
 * const stats = getDetectionStats(shopify.lines.value);
 * console.log(`Metafield: ${stats.metafield}, Keyword: ${stats.keyword}`);
 * // Track metafield adoption rate
 */
export function getDetectionStats(lines) {
  const subscriptions = getCartSubscriptions(lines);

  const stats = {
    metafield: 0,
    keyword: 0,
    total: subscriptions.length
  };

  for (const { subscription } of subscriptions) {
    if (subscription.source === 'metafield') {
      stats.metafield++;
    } else if (subscription.source === 'keyword') {
      stats.keyword++;
    }
  }

  return stats;
}

/**
 * Compatibility: Export function matching metafieldParser API
 * 
 * This allows existing code using hasSubscriptionInCart() to work
 * with the new unified detection system.
 */
export { hasSubscriptionInCart };
