/**
 * Metafield Parser
 * 
 * Parses product metafield 'custom.subscription_type' in format:
 * {interval}_{count}_{addonType}[_{addonType2}_...]
 * 
 * Examples:
 * - "quarterly_1_glass" → { interval: 'quarterly', count: 1, addOns: ['glass'] }
 * - "annual_4_glass_1_sticker" → { interval: 'annual', count: 4, addOns: ['glass', 'sticker'] }
 * 
 * Related: T006 - Implement metafield parser
 * User Story: US5 - Generic Add-On System
 */

import { isValidAddOnType } from '../config/addOnConfig.js';

/**
 * @typedef {Object} SubscriptionData
 * @property {string} interval - Subscription interval ('quarterly', 'annual', 'monthly')
 * @property {number} count - Primary add-on count (e.g., glass count)
 * @property {string[]} addOns - Array of add-on types
 * @property {Record<string, number>} addOnCounts - Map of add-on type to quantity
 * @property {string} raw - Original metafield value
 */

/**
 * Parse subscription metafield value
 * 
 * @param {string} metafieldValue - Raw metafield string
 * @returns {SubscriptionData|null} Parsed subscription data or null if invalid
 * 
 * @example
 * // Simple format
 * parseSubscriptionMetafield('quarterly_1_glass')
 * // Returns: {
 * //   interval: 'quarterly',
 * //   count: 1,
 * //   addOns: ['glass'],
 * //   addOnCounts: { glass: 1 },
 * //   raw: 'quarterly_1_glass'
 * // }
 * 
 * @example
 * // Multiple add-ons
 * parseSubscriptionMetafield('annual_4_glass_2_sticker')
 * // Returns: {
 * //   interval: 'annual',
 * //   count: 4,
 * //   addOns: ['glass', 'sticker'],
 * //   addOnCounts: { glass: 4, sticker: 2 },
 * //   raw: 'annual_4_glass_2_sticker'
 * // }
 */
export function parseSubscriptionMetafield(metafieldValue) {
  if (!metafieldValue || typeof metafieldValue !== 'string') {
    return null;
  }

  // Split by underscore
  const parts = metafieldValue.trim().toLowerCase().split('_');
  
  // Minimum format: interval_count_addonType (3 parts)
  if (parts.length < 3) {
    console.warn('[MetafieldParser] Invalid format, expected at least 3 parts:', metafieldValue);
    return null;
  }

  // Parse interval (first part)
  const interval = parts[0];
  const validIntervals = ['monthly', 'quarterly', 'annual'];
  if (!validIntervals.includes(interval)) {
    console.warn('[MetafieldParser] Invalid interval:', interval);
    return null;
  }

  // Parse count (second part)
  const count = parseInt(parts[1], 10);
  if (isNaN(count) || count <= 0) {
    console.warn('[MetafieldParser] Invalid count:', parts[1]);
    return null;
  }

  // Parse add-ons (remaining parts)
  const addOns = [];
  /** @type {Record<string, number>} */
  const addOnCounts = {};
  
  // Parse pattern: addonType or count_addonType
  for (let i = 2; i < parts.length; i++) {
    const part = parts[i];
    
    // Check if next part is a number (count for this add-on)
    const nextPart = parts[i + 1];
    const isCountNext = nextPart && !isNaN(parseInt(nextPart, 10)) && isValidAddOnType(part);
    
    if (isCountNext) {
      // Pattern: addonType_count
      const addonType = part;
      const addonCount = parseInt(nextPart, 10);
      
      if (isValidAddOnType(addonType)) {
        if (!addOns.includes(addonType)) {
          addOns.push(addonType);
        }
        addOnCounts[addonType] = addonCount;
      }
      
      i++; // Skip next part (we consumed it as count)
    } else if (isValidAddOnType(part)) {
      // Pattern: just addonType (use main count)
      const addonType = part;
      
      if (!addOns.includes(addonType)) {
        addOns.push(addonType);
      }
      
      // If not already set, use main count
      if (!(addonType in addOnCounts)) {
        addOnCounts[addonType] = count;
      }
    } else {
      console.warn('[MetafieldParser] Invalid add-on type:', part);
    }
  }

  // Must have at least one valid add-on
  if (addOns.length === 0) {
    console.warn('[MetafieldParser] No valid add-ons found in:', metafieldValue);
    return null;
  }

  return {
    interval,
    count,
    addOns,
    addOnCounts,
    raw: metafieldValue
  };
}

/**
 * Extract metafield from Shopify line item
 * 
 * @param {Object} lineItem - Shopify cart line item
 * @returns {string|null} Metafield value or null if not found
 * 
 * @example
 * const metafield = getSubscriptionMetafield(lineItem);
 * if (metafield) {
 *   const data = parseSubscriptionMetafield(metafield);
 * }
 */
export function getSubscriptionMetafield(lineItem) {
  // Check if line item has metafield
  // Note: Actual structure depends on Shopify's metafield configuration
  // This is a placeholder - adjust based on actual data structure
  
  try {
    // Common patterns:
    // 1. lineItem.merchandise.product.metafields.custom.subscription_type
    // 2. lineItem.metafields?.find(m => m.key === 'subscription_type')
    
    const product = lineItem?.merchandise?.product;
    if (product?.metafields?.custom?.subscription_type) {
      return product.metafields.custom.subscription_type;
    }
    
    // Fallback: Search in metafields array
    const metafields = lineItem?.metafields || product?.metafields;
    if (Array.isArray(metafields)) {
      const subscriptionMeta = metafields.find(
        m => m.namespace === 'custom' && m.key === 'subscription_type'
      );
      return subscriptionMeta?.value || null;
    }
    
    return null;
  } catch (error) {
    console.error('[MetafieldParser] Error extracting metafield:', error);
    return null;
  }
}

/**
 * Parse subscription data from line item
 * 
 * @param {Object} lineItem - Shopify cart line item
 * @returns {SubscriptionData|null} Parsed subscription data or null
 * 
 * @example
 * const subscription = parseLineItemSubscription(lineItem);
 * if (subscription) {
 *   console.log(`Found ${subscription.interval} subscription with ${subscription.addOns.length} add-ons`);
 * }
 */
export function parseLineItemSubscription(lineItem) {
  const metafieldValue = getSubscriptionMetafield(lineItem);
  
  if (!metafieldValue) {
    return null;
  }
  
  return parseSubscriptionMetafield(metafieldValue);
}

/**
 * Get all subscriptions from cart lines
 * 
 * @param {Object[]} lines - Shopify cart line items
 * @returns {Array<{lineItem: Object, subscription: SubscriptionData}>} Subscriptions found
 * 
 * @example
 * const subscriptions = getCartSubscriptions(shopify.lines.value);
 * subscriptions.forEach(({ lineItem, subscription }) => {
 *   console.log(`Line ${lineItem.id}: ${subscription.interval} with ${subscription.addOns.join(', ')}`);
 * });
 */
export function getCartSubscriptions(lines) {
  if (!Array.isArray(lines)) {
    return [];
  }
  
  const subscriptions = [];
  
  for (const lineItem of lines) {
    const subscription = parseLineItemSubscription(lineItem);
    
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
 * if (hasSubscriptionInCart(shopify.lines.value)) {
 *   // Show subscription benefits banner
 * }
 */
export function hasSubscriptionInCart(lines) {
  return getCartSubscriptions(lines).length > 0;
}
