/* eslint-disable react/prop-types */
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { getCartSubscriptions } from './utils/subscriptionDetector.js';
import { InclusionMessage, MultiSubscriptionSummary } from './components/InclusionMessage.jsx';
import BannerQueue from './components/BannerQueue.jsx';

/**
 * NUDUN Checkout Pro Extension - v2.0
 * 
 * Features:
 * - Generic add-on system (metafield-first, keyword fallback)
 * - Extensible configuration (5 add-on types)
 * - Subscription detection and display
 * - Real-time dynamic messaging with threshold-based incentives
 * - Production-ready with Shopify compliance
 * 
 * Phase 1 Implementation: Generic Add-On System (US5)
 * Phase 2A Implementation: Real-Time Dynamic Messaging (US6)
 */
export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  // Safe data access with optional chaining
  const lines = shopify?.lines?.value || [];
  
  // Detect subscriptions using metafield-first strategy
  const subscriptions = getCartSubscriptions(lines);
  
  // Render both subscription messages AND dynamic threshold banners
  return (
    <s-stack direction="block">
      {/* Phase 2A: Dynamic Threshold Messaging */}
      <BannerQueue 
        shopify={shopify} 
        maxVisible={2}
        allowDismiss={true}
        persistDismissed={true}
      />
      
      {/* Phase 1: Subscription Inclusion Messages */}
      {subscriptions.length === 1 && (
        <InclusionMessage subscription={subscriptions[0].subscription} />
      )}
      
      {subscriptions.length > 1 && (
        <MultiSubscriptionSummary subscriptions={subscriptions} />
      )}
    </s-stack>
  );
}
