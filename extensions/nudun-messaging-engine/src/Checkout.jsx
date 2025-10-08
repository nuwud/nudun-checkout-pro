import '@shopify/ui-extensions/preact';
import { render } from 'preact';

/**
 * NUDUN Checkout Pro Extension
 * Production-ready implementation with Shopify approval compliance:
 * - Proper error handling with optional chaining
 * - Graceful degradation when data unavailable
 * - No external dependencies or tracking
 * - Mobile-responsive UI
 */
export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  // Safe data access with optional chaining (Shopify approval requirement)
  // Note: shopify.cost.totalAmount is a signal, access .value to get the Money object
  const totalAmountObj = shopify?.cost?.totalAmount?.value;
  const itemCount = shopify?.lines?.value?.length || 0;
  
  // Graceful fallback if cart data unavailable
  if (!totalAmountObj) {
    return null; // Don't render anything if data not ready
  }
  
  // Extract amount from Money object
  // Note: Money object structure: { amount: "125.00", currencyCode: "USD" }
  const amount = totalAmountObj.amount || '0.00';
  
  return (
    <s-banner tone="info">
      <s-heading>NUDUN Checkout Pro</s-heading>
      <s-text>
        Your cart contains {itemCount} {itemCount === 1 ? 'item' : 'items'} totaling ${amount}
      </s-text>
    </s-banner>
  );
}
