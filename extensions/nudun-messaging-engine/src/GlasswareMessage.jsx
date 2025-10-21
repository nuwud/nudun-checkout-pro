import { useState, useEffect, useMemo } from 'preact/hooks';
import { detectSubscription } from './utils/subscriptionDetection';

/**
 * @typedef {Object} SubscriptionDeal
 * @property {string} id - Deal ID
 * @property {string} productHandle - Subscription product handle
 * @property {string} productTitle - Subscription product title
 * @property {string} includedProductHandle - What product is included
 * @property {string} includedProductTitle - Title of included product
 * @property {number} quantity - How many units included
 * @property {string} unitValue - Price per unit
 * @property {"complimentary"|"percentage"} discountType - Discount type
 * @property {string} [discountValue] - Discount percentage (if applicable)
 * @property {Record<string, string>} message - Localized messages (en, fr)
 */

/**
 * @typedef {Object} ShopifyGlobal
 * @property {{value: Array}} lines - Cart line items
 * @global shopify
 */

export const formatPrice = (amount, currencyCode) => {
  if (!amount || !currencyCode) return null;
  return `$${amount} ${currencyCode}`;
};

export const getMessageContent = (glassCount, interval, priceFormatted) => {
  const glassLabel = glassCount === 1 ? 'Glass' : 'Glasses';
  const heading = `íµƒ ${glassCount} Premium ${glassLabel} Included`;
  
  let description = `Complimentary ${glassLabel.toLowerCase()} included with your ${interval} subscription`;
  
  if (priceFormatted) {
    description += ` â€¢ Value: ${priceFormatted}`;
  }
  
  return { heading, description };
};

// eslint-disable-next-line react/prop-types
export const GlasswareBanner = ({ glassCount, interval, priceFormatted }) => {
  // eslint-disable-next-line react/prop-types
  const content = getMessageContent(glassCount, interval, priceFormatted);
  
  return (
    <s-banner tone="success">
      <s-heading>{content.heading}</s-heading>
      <s-text>{content.description}</s-text>
    </s-banner>
  );
};

/**
 * Fetch subscription deals configuration from the app
 * @returns {Promise<Array<SubscriptionDeal>|null>}
 */
async function fetchSubscriptionDeals() {
  try {
    const response = await fetch('/api/messaging-settings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return null;
    
    const data = await response.json();
    return data?.subscriptionDeals || [];
  } catch (error) {
    console.error('Failed to fetch subscription deals:', error);
    return null;
  }
}

/**
 * Find the deal that matches a detected subscription
 * @param {Array<SubscriptionDeal>} deals
 * @param {string} productHandle - Subscription product handle
 * @returns {SubscriptionDeal|null}
 */
function findMatchingDeal(deals, productHandle) {
  if (!deals || deals.length === 0) return null;
  return deals.find((deal) => deal.productHandle === productHandle) || null;
}

export default function GlasswareMessage({
  // eslint-disable-next-line react/prop-types
  hideIfNoSubscription = true
} = {}) {
  const [subscriptionDeals, setSubscriptionDeals] = useState(null);
  
  // Fetch subscription deals on mount
  useEffect(() => {
    (async () => {
      const deals = await fetchSubscriptionDeals();
      setSubscriptionDeals(deals || []);
    })();
  }, []);
  
  const subscriptionLines = useMemo(() => {
    // @ts-ignore - shopify.lines provided by Shopify checkout runtime
    const lines = shopify.lines.value || [];
    return lines
      .map((line) => {
        if (!line || typeof line !== 'object') return null;
        const detection = detectSubscription(line);
        if (!detection.isSubscription) return null;
        
        // Enrich detection with product handle if available
        return {
          ...detection,
          productHandle: line.merchandise?.product?.handle || null
        };
      })
      .filter(Boolean);
  }, []);
  
  const hasSubscriptions = subscriptionLines.length > 0;
  
  if (!hasSubscriptions && hideIfNoSubscription) {
    return null;
  }
  
  if (!hasSubscriptions || !subscriptionDeals || subscriptionDeals.length === 0) {
    return null;
  }
  
  // Get locale from shopify global if available
  const locale = shopify?.localization?.value?.isoCode?.toLowerCase() || 'en';
  
  return (
    <s-stack direction="block">
      {subscriptionLines.map((sub, idx) => {
        // Find the deal that matches this subscription
        const deal = findMatchingDeal(subscriptionDeals, sub.productHandle);
        
        if (!deal) {
          // No deal configured for this subscription type
          return null;
        }
        
        // Get the message in the appropriate locale
        const message = deal.message?.[locale] || deal.message?.en || '';
        
        return (
          <s-banner key={idx} tone="success">
            <s-heading>
              íµƒ {deal.quantity} {deal.includedProductTitle} Included
            </s-heading>
            <s-text>{message || `${deal.quantity} ${deal.includedProductTitle} included with your subscription`}</s-text>
          </s-banner>
        );
      })}
    </s-stack>
  );
}

export const _internals = {
  formatPrice,
  getMessageContent,
  GlasswareBanner,
  fetchSubscriptionDeals,
  findMatchingDeal
};
