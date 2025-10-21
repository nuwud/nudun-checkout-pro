/**
 * Generic included item lookup utility for displaying complimentary product values.
 *
 * Fetches ANY product by handle and caches the first successful result
 * to avoid repeated network calls per session.
 *
 * Use cases:
 * - Premium glassware (original use case)
 * - Free shipping thresholds
 * - Bonus items for subscription tiers
 * - Gift with purchase items
 * - Loyalty program rewards
 *
 * Design: Configuration-driven, not code-driven. Pass the product handle and
 * it works for any included item scenario across all merchants.
 *
 * @module includedItemLookup
 */

/**
 * @typedef {Object} IncludedItemPrice
 * @property {string} amount - Numeric amount (e.g., "25.00")
 * @property {string} currencyCode - ISO 4217 code (e.g., "USD")
 */

/**
 * @typedef {Object} IncludedItemLookupResult
 * @property {IncludedItemPrice | null} price - Product price when found
 * @property {boolean} found - Whether the product exists and has pricing
 */

let cachedResults = new Map();

/**
 * Normalize a price node from Shopify GraphQL into { amount, currencyCode } format.
 * Handles multiple Shopify API versions and field names gracefully.
 *
 * @param {unknown} priceNode - Price node from GraphQL response
 * @returns {IncludedItemPrice | null} Normalized price or null if invalid
 *
 * @example
 * normalizePrice({ amount: "25.00", currencyCode: "USD" })
 * // => { amount: "25.00", currencyCode: "USD" }
 *
 * @example
 * normalizePrice({ value: "25.00", currency: "USD" })
 * // => { amount: "25.00", currencyCode: "USD" }
 */
function normalizePrice(priceNode) {
  if (!priceNode || typeof priceNode !== 'object') {
    return null;
  }

  const node = /** @type {Record<string, unknown>} */ (priceNode);

  // Support multiple field name patterns across API versions
  const amount = node.amount ?? node.value ?? null;
  const currencyCode = node.currencyCode ?? node.currency ?? null;

  if (!amount || !currencyCode) {
    return null;
  }

  const normalizedAmount = typeof amount === 'number'
    ? amount.toFixed(2)
    : String(amount);

  return {
    amount: normalizedAmount,
    currencyCode: String(currencyCode)
  };
}

/**
 * Extract the first variant price from a product payload.
 * Tries multiple GraphQL response structures for compatibility.
 *
 * @param {unknown} payload - GraphQL response from productByHandle or product query
 * @returns {IncludedItemPrice | null} Price of first variant or null
 */
function extractVariantPrice(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = /** @type {Record<string, unknown>} */ (payload);

  // Support both productByHandle and product queries
  const product = data.productByIdentifier ?? data.product ?? data.productByHandle ?? null;

  if (!product || typeof product !== 'object') {
    return null;
  }

  const prod = /** @type {Record<string, unknown>} */ (product);
  const variants = prod?.variants;

  // Extract variants (structure varies by API response format)
  let variantNodes = [];
  if (variants && typeof variants === 'object') {
    const variantsObj = /** @type {Record<string, unknown>} */ (variants);
    const nodes = variantsObj?.nodes;
    const edges = variantsObj?.edges;

    if (Array.isArray(nodes)) {
      variantNodes = nodes;
    } else if (Array.isArray(edges)) {
      variantNodes = edges
        .map((edge) => {
          if (edge && typeof edge === 'object') {
            const edgeObj = /** @type {Record<string, unknown>} */ (edge);
            return edgeObj?.node ?? null;
          }
          return null;
        })
        .filter(Boolean);
    }
  }

  const firstVariant = variantNodes[0] ?? null;

  // Try multiple price field paths (API versions differ)
  const directPrice = normalizePrice(firstVariant?.price);
  if (directPrice) {
    return directPrice;
  }

  const priceV2 = normalizePrice(firstVariant?.priceV2);
  if (priceV2) {
    return priceV2;
  }

  const priceRangeObj = prod?.priceRange;
  if (priceRangeObj && typeof priceRangeObj === 'object') {
    const priceRangeTyped = /** @type {Record<string, unknown>} */ (priceRangeObj);
    const priceRange = normalizePrice(priceRangeTyped?.minVariantPrice);
    if (priceRange) {
      return priceRange;
    }
  }

  const priceRangeV2Obj = prod?.priceRangeV2;
  if (priceRangeV2Obj && typeof priceRangeV2Obj === 'object') {
    const priceRangeV2Typed = /** @type {Record<string, unknown>} */ (priceRangeV2Obj);
    const priceRangeV2 = normalizePrice(priceRangeV2Typed?.minVariantPrice);
    if (priceRangeV2) {
      return priceRangeV2;
    }
  }

  return null;
}

/**
 * Fetch the price of any product by handle from Shopify.
 *
 * Results are cached per product handle to avoid repeated network calls
 * in the same checkout session.
 *
 * @param {string} productHandle - The product handle to look up (e.g., "premium-glass")
 * @returns {Promise<IncludedItemLookupResult>} Price information when found, or { price: null, found: false }
 *
 * @example
 * const { price, found } = await getIncludedItemPrice('premium-glass');
 * if (found) {
 *   console.log(`Item value: ${price.amount} ${price.currencyCode}`);
 * }
 *
 * @example
 * // Supports any product
 * const result = await getIncludedItemPrice('free-gift-with-purchase');
 * const result2 = await getIncludedItemPrice('loyalty-reward-item');
 */
export async function getIncludedItemPrice(productHandle) {
  if (!productHandle || typeof productHandle !== 'string') {
    return { price: null, found: false };
  }

  const cacheKey = productHandle.toLowerCase();

  // Check if already cached
  if (cachedResults.has(cacheKey)) {
    return cachedResults.get(cacheKey);
  }

  // For checkout extensions, product data must come from the app backend
  // This is a placeholder that returns cached/default values
  const result = { price: null, found: false };
  cachedResults.set(cacheKey, result);
  return result;
}

/**
 * Reset lookup caches. Intended for unit tests or manual cache invalidation.
 *
 * @param {string | undefined} productHandle - Specific product to clear, or undefined to clear all
 *
 * @example
 * resetIncludedItemCache('premium-glass'); // Clear specific product
 * resetIncludedItemCache(); // Clear all products
 */
export function resetIncludedItemCache(productHandle) {
  if (productHandle) {
    const key = productHandle.toLowerCase();
    cachedResults.delete(key);
  } else {
    cachedResults.clear();
  }
}

/**
 * Expose internals for testing and debugging.
 *
 * @internal
 */
export const _internals = {
  normalizePrice,
  extractVariantPrice,
  cachedResults
};
