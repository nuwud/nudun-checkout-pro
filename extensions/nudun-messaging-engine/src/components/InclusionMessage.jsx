/**
 * InclusionMessage Component
 * 
 * Displays subscription add-ons in a user-friendly banner.
 * Supports multiple add-on types with extensible configuration.
 * 
 * Related: T009 - Refactor InclusionMessage component
 * User Story: US5 - Generic Add-On System
 */

/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */

import '@shopify/ui-extensions/preact';
import { formatAddOnName, getAddOnIcon } from '../config/addOnConfig.js';

/**
 * @typedef {Object} InclusionMessageProps
 * @property {Object} subscription - Subscription data with addOns and addOnCounts
 * @property {string} [locale] - Locale code (default: 'en')
 */

/**
 * InclusionMessage Component
 * 
 * Displays subscription add-ons in an info banner.
 * 
 * @param {InclusionMessageProps} props
 * @returns {JSX.Element}
 * 
 * @example
 * <InclusionMessage 
 *   subscription={{
 *     interval: 'quarterly',
 *     addOns: ['glass'],
 *     addOnCounts: { glass: 1 }
 *   }}
 * />
 * // Renders: "✨ Includes 1 Premium Glass"
 * 
 * @example
 * // Multiple add-ons
 * <InclusionMessage 
 *   subscription={{
 *     interval: 'annual',
 *     addOns: ['glass', 'sticker'],
 *     addOnCounts: { glass: 4, sticker: 2 }
 *   }}
 * />
 * // Renders: "✨ Includes 4 Premium Glasses + 2 Stickers"
 */
export function InclusionMessage({ subscription }) {
  if (!subscription || !subscription.addOns || subscription.addOns.length === 0) {
    return null;
  }

  // Format each add-on
  const addOnParts = subscription.addOns.map((addonType) => {
    const count = subscription.addOnCounts[addonType] || 0;
    const icon = getAddOnIcon(addonType);
    const name = formatAddOnName(addonType, count);
    
    return `${icon} ${name}`;
  });

  // Join with " + " for multiple add-ons
  const addOnText = addOnParts.join(' + ');

  return (
    <s-banner tone="success">
      <s-heading>✨ What's Included</s-heading>
      <s-text>{addOnText}</s-text>
    </s-banner>
  );
}

/**
 * Compact InclusionMessage (inline display)
 * 
 * For use in cart summaries or product cards where space is limited.
 * 
 * @param {InclusionMessageProps} props
 * @returns {JSX.Element}
 * 
 * @example
 * <CompactInclusionMessage subscription={subscription} />
 * // Renders: "🍷 1 Glass + ✨ 2 Stickers"
 */
export function CompactInclusionMessage({ subscription }) {
  if (!subscription || !subscription.addOns || subscription.addOns.length === 0) {
    return null;
  }

  const addOnParts = subscription.addOns.map((addonType) => {
    const count = subscription.addOnCounts[addonType] || 0;
    const icon = getAddOnIcon(addonType);
    const name = formatAddOnName(addonType, count).replace(/^\d+\s*/, ''); // Remove count prefix
    
    return `${icon} ${count} ${name}`;
  });

  const addOnText = addOnParts.join(' + ');

  return (
    <s-text>
      <strong>Includes:</strong> {addOnText}
    </s-text>
  );
}

/**
 * Detailed InclusionMessage (with images)
 * 
 * For use in checkout where we have more space and want to show product images.
 * 
 * @param {InclusionMessageProps & { showImages?: boolean }} props
 * @returns {JSX.Element}
 * 
 * @example
 * <DetailedInclusionMessage subscription={subscription} showImages={true} />
 */
export function DetailedInclusionMessage({ subscription }) {
  if (!subscription || !subscription.addOns || subscription.addOns.length === 0) {
    return null;
  }

  return (
    <s-banner tone="success">
      <s-heading>✨ Your Subscription Includes</s-heading>
      <s-stack direction="block">
        {subscription.addOns.map((addonType) => {
          const count = subscription.addOnCounts[addonType] || 0;
          const icon = getAddOnIcon(addonType);
          const name = formatAddOnName(addonType, count);

          return (
            <s-stack key={addonType} direction="inline">
              <s-text>{icon}</s-text>
              <s-text>{name}</s-text>
            </s-stack>
          );
        })}
      </s-stack>
    </s-banner>
  );
}

/**
 * Multi-Subscription Summary
 * 
 * Aggregates add-ons across multiple subscriptions in the cart.
 * 
 * @param {Object} props
 * @param {Array<{subscription: Object}>} props.subscriptions - Array of subscription data
 * @returns {JSX.Element}
 * 
 * @example
 * const subscriptions = getCartSubscriptions(shopify.lines.value);
 * <MultiSubscriptionSummary subscriptions={subscriptions} />
 * // Renders: "Total: 6 Premium Glasses + 2 Stickers across 2 subscriptions"
 */
export function MultiSubscriptionSummary({ subscriptions }) {
  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }

  // Aggregate all add-on counts
  const totalCounts = {};

  for (const { subscription } of subscriptions) {
    for (const [addonType, count] of Object.entries(subscription.addOnCounts)) {
      totalCounts[addonType] = (totalCounts[addonType] || 0) + count;
    }
  }

  // Format aggregated add-ons
  const addOnParts = Object.entries(totalCounts).map(([addonType, count]) => {
    const icon = getAddOnIcon(addonType);
    const name = formatAddOnName(addonType, count);
    return `${icon} ${name}`;
  });

  const addOnText = addOnParts.join(' + ');
  const subscriptionCount = subscriptions.length;
  const subscriptionWord = subscriptionCount === 1 ? 'subscription' : 'subscriptions';

  return (
    <s-banner tone="info">
      <s-heading>📦 Your Subscriptions</s-heading>
      <s-text>
        Total: {addOnText} across {subscriptionCount} {subscriptionWord}
      </s-text>
    </s-banner>
  );
}
