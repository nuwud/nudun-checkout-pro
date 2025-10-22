/* eslint-disable react/prop-types */
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { getCartSubscriptions } from './utils/subscriptionDetector.js';
import { InclusionMessage, MultiSubscriptionSummary } from './components/InclusionMessage.jsx';
import BannerQueue from './components/BannerQueue.jsx';
import UpsellBanner from './components/UpsellBanner.jsx';
import GlasswareMessage from './GlasswareMessage.jsx';

/**
 * Root entry point for the Checkout UI extension.
 *
 * Combines the individual messaging systems (glassware inclusion, threshold banners,
 * strategic upsells) into a single stack rendered with the Shopify Preact runtime.
 */
export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  if (typeof shopify === 'undefined') {
    return <s-text>Loading checkout data...</s-text>;
  }

  const lines = shopify?.lines?.current || [];
  const subscriptions = getCartSubscriptions(lines);

  return (
    <s-stack direction="block">
      <GlasswareMessage />

      <BannerQueue
        shopify={shopify}
        maxVisible={2}
        allowDismiss={true}
        persistDismissed={true}
      />

      <UpsellBanner shopify={shopify} />

      {subscriptions.length === 1 && (
        <InclusionMessage subscription={subscriptions[0].subscription} />
      )}

      {subscriptions.length > 1 && (
        <MultiSubscriptionSummary subscriptions={subscriptions} />
      )}
    </s-stack>
  );
}
