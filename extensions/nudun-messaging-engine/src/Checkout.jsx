/* eslint-disable react/prop-types */
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { getCartSubscriptions } from './utils/subscriptionDetector.js';
import { InclusionMessage, MultiSubscriptionSummary } from './components/InclusionMessage.jsx';

/**
 * NUDUN Checkout Pro Extension - v2.0
 * 
 * Features:
 * - Generic add-on system (metafield-first, keyword fallback)
 * - Extensible configuration (5 add-on types)
 * - Subscription detection and display
 * - Production-ready with Shopify compliance
 * 
 * Phase 1 Implementation: Generic Add-On System (US5)
 */
export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  // Safe data access with optional chaining
  const lines = shopify?.lines?.value || [];
  
  // Graceful fallback if cart data unavailable
  if (lines.length === 0) {
    return null;
  }
  
  // Detect subscriptions using metafield-first strategy
  const subscriptions = getCartSubscriptions(lines);
  
  // No subscriptions? Don't render anything
  if (subscriptions.length === 0) {
    return null;
  }
  
  // Single subscription: Show simple inclusion message
  if (subscriptions.length === 1) {
    return <InclusionMessage subscription={subscriptions[0].subscription} />;
  }
  
  // Multiple subscriptions: Show aggregated summary
  return <MultiSubscriptionSummary subscriptions={subscriptions} />;
}
