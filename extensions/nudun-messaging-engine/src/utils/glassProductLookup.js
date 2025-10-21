/**
 * Glass product lookup utility used to display complimentary glass value.
 * Fetches the glass product by handle via `shopify.query()` and caches
 * the first successful result to avoid repeated network calls per session.
 */

const GLASS_PRODUCT_HANDLE = 'premium-glass';
const DEFAULT_RESULT = Object.freeze({ price: null, found: false });

let cachedResult = null;
let inflightRequest = null;

/**
 * Normalize a price node from Shopify GraphQL responses into the
 * `{ amount, currencyCode }` format expected by checkout UI surfaces.
 *
 * @param {unknown} priceNode - Candidate price node from Shopify GraphQL
 * @returns {{ amount: string, currencyCode: string } | null}
 */
function normalizePrice(priceNode) {
  if (!priceNode || typeof priceNode !== 'object') {
    return null;
  }

  const amount = priceNode.amount ?? priceNode.value ?? null;
  const currencyCode = priceNode.currencyCode ?? priceNode.currency ?? null;

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
 *
 * @param {unknown} payload - Result of the glass product query
 * @returns {{ amount: string, currencyCode: string } | null}
 */
function extractVariantPrice(payload) {
  const product = payload?.product ?? payload?.productByHandle ?? null;

  if (!product || typeof product !== 'object') {
    return null;
  }

  const variantNodes = product?.variants?.nodes || product?.variants?.edges?.map((edge) => edge?.node) || [];
  const firstVariant = Array.isArray(variantNodes) ? variantNodes.find(Boolean) : null;

  const directPrice = normalizePrice(firstVariant?.price);
  if (directPrice) {
    return directPrice;
  }

  const priceV2 = normalizePrice(firstVariant?.priceV2);
  if (priceV2) {
    return priceV2;
  }

  const priceRange = normalizePrice(product?.priceRange?.minVariantPrice);
  if (priceRange) {
    return priceRange;
  }

  const priceRangeV2 = normalizePrice(product?.priceRangeV2?.minVariantPrice);
  if (priceRangeV2) {
    return priceRangeV2;
  }

  return null;
}

/**
 * Fetch the premium glass product price from Shopify.
 *
 * @returns {Promise<{ price: { amount: string, currencyCode: string } | null, found: boolean }>}
 *   Price information when found, otherwise `{ price: null, found: false }`
 *
 * @example
 * const { price, found } = await getGlassProductPrice();
 * if (found) {
 *   console.log(`Glass value: ${price.amount} ${price.currencyCode}`);
 * }
 */
export async function getGlassProductPrice() {
  if (cachedResult) {
    return cachedResult;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  if (typeof shopify === 'undefined' || typeof shopify?.query !== 'function') {
    cachedResult = DEFAULT_RESULT;
    return cachedResult;
  }

  inflightRequest = (async () => {
    try {
      const response = await shopify.query({
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
